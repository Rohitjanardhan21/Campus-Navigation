import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // [longitude, latitude]
  const [locationPermission, setLocationPermission] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Helper to standardize location format to [longitude, latitude] array
  const formatLocation = useCallback((locationCoords: Location.LocationObject['coords']): [number, number] | null => {
    if (!locationCoords) return null;
    const { latitude, longitude } = locationCoords;
    // Mapbox/GeoJSON typically uses [longitude, latitude]
    return [longitude, latitude];
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);

      if (granted) {
        // Get initial location immediately
        try {
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          setUserLocation(formatLocation(initialLocation.coords));
        } catch (error) {
          console.error("Error getting initial location:", error);
        }

        // Start watching position
        try {
          subscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              distanceInterval: 5,
              timeInterval: 1000,
            },
            (location) => {
              setUserLocation(formatLocation(location.coords));
            }
          );
        } catch (error) {
          console.error("Error watching location:", error);
        }
      } else {
        Alert.alert(
          'Permission Denied',
          'Allow location access to use navigation features',
          [{ text: 'OK' }]
        );
      }
    })();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        console.log('Location subscription removed.');
      }
    };
  }, [formatLocation]);

  const goToCurrentLocation = async (): Promise<[number, number] | null> => {
    try {
      if (!locationPermission) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Allow location access to use this feature',
            [{ text: 'OK' }]
          );
          return null;
        }
        setLocationPermission(true);
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const newLocation = formatLocation(location.coords);
      setUserLocation(newLocation);

      return newLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location',
        [{ text: 'OK' }]
      );
      return null;
    }
  };

  return {
    userLocation,
    locationPermission,
    goToCurrentLocation,
    setUserLocation,
  };
};


