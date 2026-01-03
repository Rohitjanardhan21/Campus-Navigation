// src/data/campusPlaces.ts

import { CampusPlace } from "../domain/campus";

export const CAMPUS_PLACES: CampusPlace[] = [
  {
    id: "main-gate",
    name: "Main Gate",
    coordinate: [77.6035, 12.9342],
    type: "entrance",
  },
  {
    id: "library",
    name: "Central Library",
    coordinate: [77.6041, 12.9349],
    type: "academic",
  },
  {
    id: "canteen",
    name: "Canteen",
    coordinate: [77.6032, 12.9334],
    type: "food",
  },
];
