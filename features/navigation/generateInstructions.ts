// features/navigation/generateInstructions.ts

import { CAMPUS_PLACES } from "@/src/data/campusPlaces";
import { CampusPlace } from "@/src/domain/campus";
import { bearing, point, distance as turfDistance } from "@turf/turf";

export interface NavigationInstruction {
  id: string;
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  coordinate: [number, number];
  type: 'start' | 'continue' | 'turn' | 'arrive';
  direction?: 'left' | 'right' | 'straight';
  landmark?: string;
}

export interface RouteProgress {
  currentInstructionIndex: number;
  distanceToNextInstruction: number;
  totalDistanceRemaining: number;
  estimatedTimeRemaining: number;
  isOffRoute: boolean;
}

export const generateInstructions = (
  routeCoordinates: [number, number][],
  destination: CampusPlace
): NavigationInstruction[] => {
  if (routeCoordinates.length < 2) return [];

  const instructions: NavigationInstruction[] = [];
  const walkingSpeed = 1.4; // m/s (average walking speed)

  // Start instruction
  instructions.push({
    id: 'start',
    instruction: `Head towards ${destination.name}`,
    distance: 0,
    duration: 0,
    coordinate: routeCoordinates[0],
    type: 'start'
  });

  // Generate intermediate instructions
  for (let i = 1; i < routeCoordinates.length - 1; i++) {
    const prev = routeCoordinates[i - 1];
    const current = routeCoordinates[i];
    const next = routeCoordinates[i + 1];

    const distanceToNext = turfDistance(
      point(current),
      point(next),
      { units: 'meters' }
    );

    // Calculate bearing change to determine turn direction
    const bearingToCurrent = bearing(point(prev), point(current));
    const bearingToNext = bearing(point(current), point(next));
    const bearingDiff = ((bearingToNext - bearingToCurrent + 540) % 360) - 180;

    // Find nearby landmark
    const nearbyLandmark = findNearbyLandmark(current);

    let instruction = '';
    let direction: 'left' | 'right' | 'straight' | undefined;
    let type: NavigationInstruction['type'] = 'continue';

    if (Math.abs(bearingDiff) > 30) {
      type = 'turn';
      if (bearingDiff > 0) {
        direction = 'right';
        instruction = nearbyLandmark 
          ? `Turn right towards ${nearbyLandmark}`
          : 'Turn right';
      } else {
        direction = 'left';
        instruction = nearbyLandmark 
          ? `Turn left towards ${nearbyLandmark}`
          : 'Turn left';
      }
    } else {
      instruction = nearbyLandmark 
        ? `Continue straight past ${nearbyLandmark}`
        : 'Continue straight';
    }

    instructions.push({
      id: `step-${i}`,
      instruction,
      distance: Math.round(distanceToNext),
      duration: Math.round(distanceToNext / walkingSpeed),
      coordinate: current,
      type,
      direction,
      landmark: nearbyLandmark
    });
  }

  // Arrival instruction
  const lastCoord = routeCoordinates[routeCoordinates.length - 1];
  instructions.push({
    id: 'arrive',
    instruction: `Arrive at ${destination.name}`,
    distance: 0,
    duration: 0,
    coordinate: lastCoord,
    type: 'arrive'
  });

  return instructions;
};

const findNearbyLandmark = (coordinate: [number, number]): string | undefined => {
  const threshold = 0.0005; // roughly 50 meters
  
  const nearbyPlace = CAMPUS_PLACES.find(place => {
    const dist = turfDistance(
      point(coordinate),
      point(place.coordinate),
      { units: 'degrees' }
    );
    return dist < threshold;
  });

  return nearbyPlace?.name;
};

export const calculateRouteProgress = (
  userLocation: [number, number],
  instructions: NavigationInstruction[],
  currentInstructionIndex: number
): RouteProgress => {
  if (instructions.length === 0) {
    return {
      currentInstructionIndex: 0,
      distanceToNextInstruction: 0,
      totalDistanceRemaining: 0,
      estimatedTimeRemaining: 0,
      isOffRoute: false
    };
  }

  const currentInstruction = instructions[currentInstructionIndex];
  const distanceToNext = turfDistance(
    point(userLocation),
    point(currentInstruction.coordinate),
    { units: 'meters' }
  );

  // Calculate total remaining distance
  let totalDistanceRemaining = distanceToNext;
  for (let i = currentInstructionIndex + 1; i < instructions.length; i++) {
    totalDistanceRemaining += instructions[i].distance;
  }

  // Calculate estimated time remaining (walking speed: 1.4 m/s)
  const estimatedTimeRemaining = Math.round(totalDistanceRemaining / 1.4);

  // Check if user is off route (more than 20 meters from expected path)
  const isOffRoute = distanceToNext > 20;

  return {
    currentInstructionIndex,
    distanceToNextInstruction: Math.round(distanceToNext),
    totalDistanceRemaining: Math.round(totalDistanceRemaining),
    estimatedTimeRemaining,
    isOffRoute
  };
};

export const getNextInstruction = (
  userLocation: [number, number],
  instructions: NavigationInstruction[],
  currentIndex: number
): { nextIndex: number; shouldAdvance: boolean } => {
  if (currentIndex >= instructions.length - 1) {
    return { nextIndex: currentIndex, shouldAdvance: false };
  }

  const currentInstruction = instructions[currentIndex];
  const distanceToInstruction = turfDistance(
    point(userLocation),
    point(currentInstruction.coordinate),
    { units: 'meters' }
  );

  // Advance to next instruction if within 10 meters of current instruction point
  const shouldAdvance = distanceToInstruction < 10;
  const nextIndex = shouldAdvance ? Math.min(currentIndex + 1, instructions.length - 1) : currentIndex;

  return { nextIndex, shouldAdvance };
};