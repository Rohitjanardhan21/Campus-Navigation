// features/navigation/mapboxRouting.ts

import { point, distance as turfDistance } from "@turf/turf";
import { Feature, LineString } from "geojson";

export interface MapboxRouteResponse {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
      type: "LineString";
    };
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
          type: string;
          modifier?: string;
          location: [number, number];
        };
        geometry: {
          coordinates: [number, number][];
        };
        distance: number;
        duration: number;
      }>;
      distance: number;
      duration: number;
    }>;
    distance: number;
    duration: number;
  }>;
}

export interface NavigationStep {
  id: string;
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  coordinate: [number, number];
  type: 'start' | 'continue' | 'turn' | 'arrive';
  direction?: 'left' | 'right' | 'straight';
}

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidmFydW5rbTM2MCIsImEiOiJjbWVpNHA5eGswNjBtMmtxdGxia2cxN2w2In0.f88HMcQt5Lh9ZQGIpeNKug";

export const getMapboxRoute = async (
  startCoord: [number, number],
  endCoord: [number, number]
): Promise<{
  coordinates: [number, number][];
  duration: number;
  distance: number;
  feature: Feature<LineString>;
  steps: NavigationStep[];
} | null> => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    console.log('Fetching route from Mapbox:', url);
    
    const response = await fetch(url);
    const data: MapboxRouteResponse = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.error('No routes found');
      return null;
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates;
    
    // Convert Mapbox steps to our NavigationStep format
    const steps: NavigationStep[] = [];
    let stepIndex = 0;
    
    // Add start step
    steps.push({
      id: 'start',
      instruction: 'Start your journey',
      distance: 0,
      duration: 0,
      coordinate: coordinates[0],
      type: 'start'
    });
    
    // Process route steps
    for (const leg of route.legs) {
      for (const step of leg.steps) {
        stepIndex++;
        
        let type: NavigationStep['type'] = 'continue';
        let direction: NavigationStep['direction'] | undefined;
        
        // Determine step type based on maneuver
        if (step.maneuver.type === 'turn') {
          type = 'turn';
          direction = step.maneuver.modifier?.includes('left') ? 'left' : 
                    step.maneuver.modifier?.includes('right') ? 'right' : 'straight';
        } else if (step.maneuver.type === 'arrive') {
          type = 'arrive';
        }
        
        steps.push({
          id: `step-${stepIndex}`,
          instruction: step.maneuver.instruction,
          distance: Math.round(step.distance),
          duration: Math.round(step.duration),
          coordinate: step.maneuver.location,
          type,
          direction
        });
      }
    }
    
    // Create GeoJSON feature
    const feature: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    };
    
    return {
      coordinates,
      duration: Math.round(route.duration / 60), // Convert to minutes
      distance: parseFloat((route.distance / 1000).toFixed(2)), // Convert to km
      feature,
      steps
    };
    
  } catch (error) {
    console.error('Mapbox routing error:', error);
    return null;
  }
};

export const calculateRouteProgress = (
  userLocation: [number, number],
  steps: NavigationStep[],
  currentStepIndex: number
): {
  currentStepIndex: number;
  distanceToNextStep: number;
  totalDistanceRemaining: number;
  estimatedTimeRemaining: number;
  isOffRoute: boolean;
} => {
  if (steps.length === 0) {
    return {
      currentStepIndex: 0,
      distanceToNextStep: 0,
      totalDistanceRemaining: 0,
      estimatedTimeRemaining: 0,
      isOffRoute: false
    };
  }

  const currentStep = steps[currentStepIndex];
  const distanceToNext = turfDistance(
    point(userLocation),
    point(currentStep.coordinate),
    { units: 'meters' }
  );

  // Calculate total remaining distance
  let totalDistanceRemaining = distanceToNext;
  for (let i = currentStepIndex + 1; i < steps.length; i++) {
    totalDistanceRemaining += steps[i].distance;
  }

  // Calculate estimated time remaining (walking speed: 1.4 m/s)
  const estimatedTimeRemaining = Math.round(totalDistanceRemaining / 1.4);

  // Check if user is off route (more than 50 meters from expected path)
  const isOffRoute = distanceToNext > 50;

  return {
    currentStepIndex,
    distanceToNextStep: Math.round(distanceToNext),
    totalDistanceRemaining: Math.round(totalDistanceRemaining),
    estimatedTimeRemaining,
    isOffRoute
  };
};

export const getNextStep = (
  userLocation: [number, number],
  steps: NavigationStep[],
  currentIndex: number
): { nextIndex: number; shouldAdvance: boolean } => {
  if (currentIndex >= steps.length - 1) {
    return { nextIndex: currentIndex, shouldAdvance: false };
  }

  const currentStep = steps[currentIndex];
  const distanceToStep = turfDistance(
    point(userLocation),
    point(currentStep.coordinate),
    { units: 'meters' }
  );

  // Advance to next step if within 20 meters of current step point
  const shouldAdvance = distanceToStep < 20;
  const nextIndex = shouldAdvance ? Math.min(currentIndex + 1, steps.length - 1) : currentIndex;

  return { nextIndex, shouldAdvance };
};