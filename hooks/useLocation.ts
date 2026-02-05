import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationPermission, setLocationPermission] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Convert Expo coords → Mapbox coords
  const formatLocation = useCallback(
    (coords: Location.LocationObject["coords"]): [number, number] | null => {
      if (!coords) return null;
      return [coords.longitude, coords.latitude];
    },
    [],
  );

  // 🔐 SINGLE permission gate
  const ensurePermission = async (): Promise<boolean> => {
    if (locationPermission) return true;

    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setLocationPermission(granted);

    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "Allow location access to use navigation features",
        [{ text: "OK" }],
      );
    }

    return granted;
  };

  // 📍 Initial location + live tracking
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const granted = await ensurePermission();
      if (!granted || !isMounted) return;

      try {
        // Initial fix
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted) {
          setUserLocation(formatLocation(initial.coords));
        }

        // Live updates
        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (location) => {
            if (isMounted) {
              setUserLocation(formatLocation(location.coords));
            }
          },
        );
      } catch (error) {
        console.error("Location error:", error);
      }
    })();

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [ensurePermission, formatLocation]);

  // 🎯 Manual recenter action
  const goToCurrentLocation = async (): Promise<[number, number] | null> => {
    try {
      const granted = await ensurePermission();
      if (!granted) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const formatted = formatLocation(location.coords);
      setUserLocation(formatted);

      return formatted;
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Unable to get your current location", [
        { text: "OK" },
      ]);
      return null;
    }
  };

  return {
    userLocation,
    locationPermission,
    goToCurrentLocation,
  };
};
