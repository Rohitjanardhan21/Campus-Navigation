// Enhanced Mapbox integration hook
import { MapboxDataService } from '@/services/mapboxDataService';
import { useCallback, useState } from 'react';

export interface EnhancedPOI {
  id: string;
  name: string;
  coordinate: [number, number];
  category: string;
  address?: string;
  phone?: string;
  website?: string;
  thumbnail?: string;
  reachableIn?: number; // minutes walking
}

export const useEnhancedMapbox = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pois, setPois] = useState<EnhancedPOI[]>([]);
  const [reachableAreas, setReachableAreas] = useState<any[]>([]);

  // Enhanced search with geocoding
  const searchWithGeocoding = useCallback(async (query: string, userLocation?: [number, number]) => {
    setIsLoading(true);
    try {
      // Search using Mapbox geocoding
      const results = await MapboxDataService.geocodeAddress(query, [77.45, 12.92, 77.51, 12.96]);
      
      // Enhance results with thumbnails and travel times
      const enhancedResults = await Promise.all(
        results.map(async (result) => {
          const enhanced: EnhancedPOI = {
            id: `geocoded_${Date.now()}_${Math.random()}`,
            name: result.name,
            coordinate: result.coordinate,
            category: result.category || 'unknown',
            address: result.address,
            thumbnail: MapboxDataService.generateStaticMap(result.coordinate, 16, [200, 150])
          };

          // Calculate walking time if user location available
          if (userLocation) {
            try {
              const matrix = await MapboxDataService.getTravelMatrix([userLocation, result.coordinate]);
              enhanced.reachableIn = Math.round(matrix.durations[0][1] / 60); // Convert to minutes
            } catch (error) {
              console.warn('Could not calculate travel time:', error);
            }
          }

          return enhanced;
        })
      );

      setPois(enhancedResults);
      return enhancedResults;
    } catch (error) {
      console.error('Enhanced search failed:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show reachable areas
  const showReachableAreas = useCallback(async (location: [number, number], minutes: number[] = [5, 10, 15]) => {
    setIsLoading(true);
    try {
      const areas = await MapboxDataService.getReachableArea(location, minutes);
      setReachableAreas(areas);
      return areas;
    } catch (error) {
      console.error('Failed to get reachable areas:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Find nearby POIs by category
  const findNearbyPOIs = useCallback(async (
    location: [number, number], 
    category: string,
    radius: number = 500
  ) => {
    setIsLoading(true);
    try {
      const results = await MapboxDataService.searchPOI(category, location, radius, [category]);
      
      const enhancedPOIs = results.map(poi => ({
        ...poi,
        thumbnail: MapboxDataService.generateStaticMap(poi.coordinate, 17, [150, 100])
      }));

      return enhancedPOIs;
    } catch (error) {
      console.error('Failed to find nearby POIs:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get address from coordinates
  const getAddressFromCoordinates = useCallback(async (coordinate: [number, number]) => {
    try {
      const result = await MapboxDataService.reverseGeocode(coordinate);
      return result?.address || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return 'Unknown location';
    }
  }, []);

  // Calculate optimal route through multiple points
  const calculateOptimalRoute = useCallback(async (points: [number, number][]) => {
    setIsLoading(true);
    try {
      // Get travel matrix
      const matrix = await MapboxDataService.getTravelMatrix(points);
      
      // Simple nearest neighbor algorithm for optimal order
      const visited = new Set<number>();
      const route = [0]; // Start from first point
      visited.add(0);
      
      let current = 0;
      while (visited.size < points.length) {
        let nearest = -1;
        let shortestTime = Infinity;
        
        for (let i = 0; i < points.length; i++) {
          if (!visited.has(i) && matrix.durations[current][i] < shortestTime) {
            shortestTime = matrix.durations[current][i];
            nearest = i;
          }
        }
        
        if (nearest !== -1) {
          route.push(nearest);
          visited.add(nearest);
          current = nearest;
        }
      }
      
      return {
        optimalOrder: route,
        totalTime: route.reduce((total, pointIndex, i) => {
          if (i === 0) return 0;
          return total + matrix.durations[route[i-1]][pointIndex];
        }, 0),
        points: route.map(index => points[index])
      };
    } catch (error) {
      console.error('Failed to calculate optimal route:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    pois,
    reachableAreas,
    
    // Methods
    searchWithGeocoding,
    showReachableAreas,
    findNearbyPOIs,
    getAddressFromCoordinates,
    calculateOptimalRoute,
    
    // Utilities
    generateMapThumbnail: MapboxDataService.generateStaticMap,
    clearResults: () => {
      setPois([]);
      setReachableAreas([]);
    }
  };
};