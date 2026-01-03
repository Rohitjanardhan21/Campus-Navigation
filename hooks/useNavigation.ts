import { addStartNodeOnEdge } from "@/features/navigation/addStartNodeOnEdge";
import { buildGraph } from "@/features/navigation/buildGraph";
import { dijkstra } from "@/features/navigation/dijkstra";
import { findNearestNode } from "@/features/navigation/findNearestNode";
import { routeToGeoJSON } from "@/features/navigation/routeToGeoJson";
import { snapToPathsWithSegment } from "@/features/navigation/snapToPath";
import { CAMPUS_PATHS } from "@/src/data/geo/paths";
import { CampusPlace } from "@/src/domain/campus";
import { point, distance as turfDistance } from "@turf/turf";
import { Feature, LineString } from "geojson";
import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Easing } from "react-native";

export interface RouteInfo {
  coordinates: [number, number][];
  duration: number; // in minutes
  distance: number; // in km
  feature?: Feature<LineString>;
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

  const slideAnim = useRef(new Animated.Value(-100)).current;

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

  // Calculate route using graph-based Dijkstra algorithm
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

        // Build graph from campus paths
        const graph = buildGraph(CAMPUS_PATHS);

        // Snap start to path
        const snapInfo = snapToPathsWithSegment(startCoords, CAMPUS_PATHS);
        if (snapInfo.index >= snapInfo.line.length - 1) {
          console.error("Invalid snap index");
          return null;
        }

        // Add start node on edge
        const { graph: updatedGraph, startNodeId } = addStartNodeOnEdge(
          graph,
          snapInfo.snappedCoord,
          snapInfo.line[snapInfo.index],
          snapInfo.line[snapInfo.index + 1]
        );

        // Find nearest node to destination
        const endNodeId = findNearestNode(endCoords, updatedGraph);

        // Calculate route using Dijkstra
        const route = dijkstra(updatedGraph, startNodeId, endNodeId);

        if (route.length === 0) {
          console.error("No route found");
          return null;
        }

        // Convert to GeoJSON
        const routeFeature = routeToGeoJSON(route, updatedGraph);

        // Calculate distance and time
        let totalDistance = 0;
        for (let i = 1; i < route.length; i++) {
          const from = updatedGraph.nodes[route[i - 1]].coord;
          const to = updatedGraph.nodes[route[i]].coord;
          if (from && to) {
            totalDistance += turfDistance(point(from), point(to), {
              units: "meters",
            });
          }
        }

        const distanceKm = (totalDistance / 1000).toFixed(1);
        // Estimate walking time (5 km/h average walking speed)
        const duration = Math.round((parseFloat(distanceKm) / 5) * 60);

        return {
          coordinates: routeFeature.geometry.coordinates as [number, number][],
          duration,
          distance: parseFloat(distanceKm),
          feature: routeFeature,
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
    startNavigation,
    stopNavigation,
    handleMapPress,
    handleImmediateMapNavigation,
    createCustomDestination,
    setShowDestinationOptions,
    setSelectedDestination,
  };
};
