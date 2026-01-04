import {
    calculateRouteProgress as calculateMapboxProgress,
    getMapboxRoute,
    getNextStep as getNextMapboxStep,
    NavigationStep
} from "@/features/navigation/mapboxRouting";
import { CampusPlace } from "@/src/domain/campus";
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

  // Update location tracking for turn-by-turn navigation
  const updateNavigationProgress = useCallback((userLocation: [number, number]) => {
    if (!isNavigating || navigationSteps.length === 0) return;

    // Calculate current progress
    const progress = calculateMapboxProgress(userLocation, navigationSteps, currentStepIndex);
    setRouteProgress(progress);

    // Check if we need to advance to next step
    const { nextIndex, shouldAdvance } = getNextMapboxStep(userLocation, navigationSteps, currentStepIndex);
    
    if (shouldAdvance && nextIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIndex);
    }

    // Check if rerouting is needed
    if (progress.isOffRoute && !needsRerouting) {
      setNeedsRerouting(true);
      // Auto-reroute after 5 seconds of being off route
      setTimeout(() => {
        if (selectedDestination) {
          handleRerouting(userLocation, selectedDestination);
        }
      }, 5000);
    }
  }, [isNavigating, navigationSteps, currentStepIndex, needsRerouting, selectedDestination]);

  // Handle rerouting when user goes off path
  const handleRerouting = useCallback(async (
    userLocation: [number, number],
    destination: CampusPlace
  ) => {
    try {
      setNeedsRerouting(false);
      const newRoute = await calculateRoute(userLocation, getSafeCoordinates(destination)!);
      
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
      endCoords: [number, number]
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

        // Use Mapbox Directions API for real road routing
        const mapboxRoute = await getMapboxRoute(startCoords, endCoords);
        
        if (!mapboxRoute) {
          console.error("No route found from Mapbox");
          return null;
        }

        return {
          coordinates: mapboxRoute.coordinates,
          duration: mapboxRoute.duration,
          distance: mapboxRoute.distance,
          feature: mapboxRoute.feature,
          steps: mapboxRoute.steps
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

      try {
        const route = await calculateRoute(userLocation, destCoords);

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
