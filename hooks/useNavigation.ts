import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getCampusRoute } from "@/features/navigation/campusRouting";
import {
    calculateRouteProgress as calculateMapboxProgress,
    NavigationStep
} from "@/features/navigation/mapboxRouting";
import { CampusPlace } from "@/src/domain/campus";
import {
    lineSlice,
    nearestPointOnLine,
    point,
    distance as turfDistance,
    length as turfLength,
} from "@turf/turf";
import { Feature, LineString } from "geojson";
import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Easing } from "react-native";

export interface RouteInfo {
  coordinates: [number, number][];
  duration: number; // in minutes
  distance: number; // in km
  feature?: Feature<LineString>;
  steps?: NavigationStep[];
}

export interface RouteProgress {
  currentStepIndex: number;
  distanceToNextStep: number;
  totalDistanceRemaining: number;
  estimatedTimeRemaining: number;
  isOffRoute: boolean;
}

export const useNavigation = () => {
  // Use optional chaining and provide defaults in case contexts aren't available
  let settings = { autoReroute: true, saveHistory: true };
  let addToHistory = async () => {};
  
  try {
    const settingsContext = useSettings();
    settings = settingsContext.settings;
  } catch (e) {
    console.warn('Settings context not available');
  }
  
  try {
    const historyContext = useNavigationHistory();
    addToHistory = historyContext.addToHistory;
  } catch (e) {
    console.warn('Navigation history context not available');
  }
  
  const [selectedDestination, setSelectedDestination] =
    useState<CampusPlace | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showDestinationOptions, setShowDestinationOptions] = useState(false);
  const [tappedCoordinate, setTappedCoordinate] = useState<
    [number, number] | null
  >(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // New turn-by-turn navigation state
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [routeProgress, setRouteProgress] = useState<RouteProgress>({
    currentStepIndex: 0,
    distanceToNextStep: 0,
    totalDistanceRemaining: 0,
    estimatedTimeRemaining: 0,
    isOffRoute: false
  });
  const [needsRerouting, setNeedsRerouting] = useState(false);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const lastUserLocationRef = useRef<[number, number] | null>(null);
  const lastStepDistanceRef = useRef<number | null>(null);
  const lastRemainingDistanceRef = useRef<number | null>(null);
  const lastRerouteTimeRef = useRef<number>(0);
  const lastRerouteLocationRef = useRef<[number, number] | null>(null);

  // Update location tracking for turn-by-turn navigation
  const updateNavigationProgress = useCallback((userLocation: [number, number]) => {
    if (!isNavigating || navigationSteps.length === 0) return;

    // Calculate current progress
    const progress = calculateMapboxProgress(
      userLocation,
      navigationSteps,
      currentStepIndex
    );

    let isOffRoute = progress.isOffRoute;
    let remainingDistanceMeters = progress.totalDistanceRemaining;
    if (routeInfo?.feature) {
      try {
        const nearest = nearestPointOnLine(
          routeInfo.feature,
          point(userLocation)
        );
        const dist = turfDistance(
          point(userLocation),
          nearest,
          { units: "meters" }
        );
        isOffRoute = dist > 15; // meters off route

        const coords = routeInfo.feature.geometry
          .coordinates as [number, number][];
        if (coords.length > 1) {
          const lineToEnd = lineSlice(
            nearest,
            point(coords[coords.length - 1]),
            routeInfo.feature
          );
          const kmRemaining = turfLength(lineToEnd, { units: "kilometers" });
          remainingDistanceMeters = Math.round(kmRemaining * 1000);
        }
      } catch (error) {
        console.warn("Off-route check failed:", error);
      }
    }

    const distanceToNextStep = navigationSteps[currentStepIndex]
      ? Math.round(
          turfDistance(
            point(userLocation),
            point(navigationSteps[currentStepIndex].coordinate),
            { units: "meters" }
          )
        )
      : progress.distanceToNextStep;

    setRouteProgress({
      ...progress,
      isOffRoute,
      distanceToNextStep,
      totalDistanceRemaining: remainingDistanceMeters,
      estimatedTimeRemaining: Math.round(remainingDistanceMeters / 1.4),
    });

    // Auto-reroute if enabled and user is off route
    if (settings.autoReroute && isOffRoute && selectedDestination) {
      const timeSinceLastReroute = Date.now() - (lastRerouteTimeRef.current || 0);
      // Only reroute once every 10 seconds to avoid excessive recalculations
      if (timeSinceLastReroute > 10000) {
        console.log("User is off route, recalculating...");
        lastRerouteTimeRef.current = Date.now();
        // Recalculate route from current location
        calculateRoute(userLocation, selectedDestination.coordinate, selectedDestination).then((newRoute) => {
          if (newRoute) {
            setRouteInfo(newRoute);
            setNavigationSteps(newRoute.steps || []);
            setCurrentStepIndex(0);
            setTravelTime(newRoute.duration);
            setDistance(newRoute.distance);
          }
        });
      }
    }

    // Check if we need to advance to next step
    const currentStep = navigationSteps[currentStepIndex];
    if (currentStep) {
      const distanceToStep = turfDistance(
        point(userLocation),
        point(currentStep.coordinate),
        { units: "meters" }
      );

      const lastLocation = lastUserLocationRef.current;
      const movedMeters = lastLocation
        ? turfDistance(point(lastLocation), point(userLocation), {
            units: "meters",
          })
        : 0;

      const lastStepDistance = lastStepDistanceRef.current;
      const isGettingCloser =
        lastStepDistance === null || distanceToStep < lastStepDistance - 1;

      if (
        distanceToStep < 10 &&
        movedMeters > 3 &&
        isGettingCloser &&
        currentStepIndex < navigationSteps.length - 1
      ) {
        setCurrentStepIndex(currentStepIndex + 1);
      }

      lastStepDistanceRef.current = distanceToStep;
    }

    lastUserLocationRef.current = userLocation;

    const lastRemaining = lastRemainingDistanceRef.current;
    const lastRerouteLocation = lastRerouteLocationRef.current;
    const movedSinceReroute = lastRerouteLocation
      ? turfDistance(point(lastRerouteLocation), point(userLocation), {
          units: "meters",
        })
      : 0;

    const isGettingFurther =
      lastRemaining !== null && remainingDistanceMeters > lastRemaining + 10;

    // Check if rerouting is needed
    if ((isOffRoute || isGettingFurther) && !needsRerouting) {
      setNeedsRerouting(true);
      // Auto-reroute after 2 seconds of being off route
      setTimeout(() => {
        if (selectedDestination) {
          handleRerouting(userLocation, selectedDestination);
        }
      }, 2000);
    }

    lastRemainingDistanceRef.current = remainingDistanceMeters;
    if (isOffRoute || isGettingFurther) {
      if (movedSinceReroute > 5 || !lastRerouteLocation) {
        lastRerouteLocationRef.current = userLocation;
      }
    }
  }, [
    isNavigating,
    navigationSteps,
    currentStepIndex,
    needsRerouting,
    selectedDestination,
    routeInfo,
  ]);

  // Handle rerouting when user goes off path
  const handleRerouting = useCallback(async (
    userLocation: [number, number],
    destination: CampusPlace
  ) => {
    try {
      setNeedsRerouting(false);
      const newRoute = await calculateRoute(
        userLocation,
        getSafeCoordinates(destination)!,
        destination
      );
      
      if (newRoute) {
        setRouteInfo(newRoute);
        setNavigationSteps(newRoute.steps || []);
        setCurrentStepIndex(0);
        setTravelTime(newRoute.duration);
        setDistance(newRoute.distance);
      }
    } catch (error) {
      console.error('Rerouting failed:', error);
    }
  }, []);
  // Helper function to validate coordinates
  const validateCoordinates = (coords: [number, number]): boolean => {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return false;
    }

    const [lng, lat] = coords;
    return (
      typeof lng === "number" &&
      typeof lat === "number" &&
      !isNaN(lng) &&
      !isNaN(lat) &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  };

  // Helper function for safe coordinate extraction
  const getSafeCoordinates = (
    location: CampusPlace | [number, number] | null
  ): [number, number] | null => {
    if (!location) return null;

    if (Array.isArray(location)) {
      if (location.length === 2 && validateCoordinates(location)) {
        return location;
      }
      return null;
    }

    if (location.coordinate && Array.isArray(location.coordinate)) {
      if (
        location.coordinate.length === 2 &&
        validateCoordinates(location.coordinate)
      ) {
        return location.coordinate;
      }
      return null;
    }

    return null;
  };

  // Calculate route using Mapbox Directions API
  const calculateRoute = useCallback(
    async (
      startCoords: [number, number],
      endCoords: [number, number],
      destination?: CampusPlace
    ): Promise<RouteInfo | null> => {
      try {
        if (
          !validateCoordinates(startCoords) ||
          !validateCoordinates(endCoords)
        ) {
          console.error("Invalid coordinates for route calculation");
          return null;
        }

        console.log("Calculating route from:", startCoords, "to:", endCoords);

        // Use campus paths routing
        const campusRoute = await getCampusRoute(
          startCoords,
          endCoords,
          destination
        );

        if (!campusRoute) {
          console.error("No route found from campus paths");
          return null;
        }

        return {
          coordinates: campusRoute.coordinates,
          duration: campusRoute.duration,
          distance: campusRoute.distance,
          feature: campusRoute.feature,
          steps: campusRoute.steps,
        };
      } catch (error) {
        console.error("Route calculation error:", error);
        return null;
      }
    },
    []
  );

  // Start active navigation
  const startNavigation = useCallback(
    async (
      userLocation: [number, number] | null,
      destination:
        | CampusPlace
        | { coordinate: [number, number]; name: string; id: string }
    ): Promise<boolean> => {
      console.log("=== STARTING NAVIGATION ===");

      try {
        if (!userLocation) {
          Alert.alert("Error", "Current location not available");
          return false;
        }

        const destCoords = getSafeCoordinates(destination as CampusPlace);
        if (!destCoords) {
          Alert.alert("Error", "Invalid destination coordinates");
          return false;
        }

        setIsCalculatingRoute(true);

        const route = await calculateRoute(
          userLocation,
          destCoords,
          destination as CampusPlace
        );

        if (route) {
          setRouteInfo(route);
          setTravelTime(route.duration);
          setDistance(route.distance);
          setSelectedDestination(destination as CampusPlace);
          
          // Set up turn-by-turn navigation
          setNavigationSteps(route.steps || []);
          setCurrentStepIndex(0);
          setRouteProgress({
            currentStepIndex: 0,
            distanceToNextStep: 0,
            totalDistanceRemaining: route.distance * 1000,
            estimatedTimeRemaining: route.duration * 60,
            isOffRoute: false
          });

          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();

          setIsNavigating(true);
          
          // Save to history if enabled
          if (settings.saveHistory) {
            addToHistory({
              destination: destination as CampusPlace,
              duration: route.duration,
              distance: route.distance,
            });
          }
          
          return true;
        } else {
          throw new Error("No route found");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert(
          "Navigation Error",
          "Could not calculate route. Please try again."
        );
        return false;
      } finally {
        setIsCalculatingRoute(false);
      }
    },
    [calculateRoute, slideAnim]
  );

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setSelectedDestination(null);
    setRouteInfo(null);
    setTravelTime(null);
    setDistance(null);
    
    // Reset turn-by-turn navigation state
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    setRouteProgress({
      currentStepIndex: 0,
      distanceToNextStep: 0,
      totalDistanceRemaining: 0,
      estimatedTimeRemaining: 0,
      isOffRoute: false
    });
    setNeedsRerouting(false);

    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Handle map press for destination selection
  const handleMapPress = useCallback(
    (event: { geometry: { coordinates: [number, number] } }) => {
      try {
        const coordinate = event.geometry.coordinates;
        if (validateCoordinates(coordinate)) {
          setTappedCoordinate(coordinate);
          setShowDestinationOptions(true);
        } else {
          console.error("Invalid coordinates from map press");
        }
      } catch (error) {
        console.error("Error handling map press:", error);
      }
    },
    []
  );

  // Immediate navigation handler
  const handleImmediateMapNavigation = useCallback(
    async (
      event: { geometry: { coordinates: [number, number] } },
      userLocation: [number, number] | null
    ): Promise<boolean> => {
      try {
        const coordinate = event.geometry.coordinates;

        if (!validateCoordinates(coordinate) || !userLocation) {
          Alert.alert(
            "Error",
            "Invalid location tapped or current location unavailable."
          );
          return false;
        }

        const destination: CampusPlace = {
          id: "tap-" + Date.now(),
          name: `Tapped Location`,
          coordinate: coordinate,
          type: "academic",
        };

        setShowDestinationOptions(false);
        await startNavigation(userLocation, destination);

        return true;
      } catch (error) {
        console.error("Error in handleImmediateMapNavigation:", error);
        Alert.alert("Error", "Failed to start route from tapped location.");
        return false;
      }
    },
    [startNavigation]
  );

  const createCustomDestination = useCallback((): CampusPlace | null => {
    if (!tappedCoordinate || !validateCoordinates(tappedCoordinate)) {
      Alert.alert("Error", "No valid location tapped on map");
      return null;
    }
    const customDestination: CampusPlace = {
      id: "custom-" + Date.now(),
      name: "Custom Destination",
      coordinate: tappedCoordinate,
      type: "academic",
    };
    setSelectedDestination(customDestination);
    setShowDestinationOptions(false);
    return customDestination;
  }, [tappedCoordinate]);

  return {
    selectedDestination,
    routeInfo,
    isNavigating,
    travelTime,
    distance,
    showDestinationOptions,
    tappedCoordinate,
    slideAnim,
    isCalculatingRoute,
    // Turn-by-turn navigation
    navigationSteps,
    currentStepIndex,
    routeProgress,
    needsRerouting,
    updateNavigationProgress,
    startNavigation,
    stopNavigation,
    handleMapPress,
    handleImmediateMapNavigation,
    createCustomDestination,
    setShowDestinationOptions,
    setSelectedDestination,
  };
};
