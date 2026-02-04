// src/data/campusPlaces.ts

import { CampusPlace } from "../domain/campus";

export const CAMPUS_PLACES: CampusPlace[] = [
  // Entrances
  {
    id: "main-gate",
    name: "Main Gate",
    coordinate: [77.434965, 12.86374],
    type: "entrance",
    description: "Primary entrance to campus",
    hours: "24/7",
  },
  {
    id: "first-block",
    name: "First Block",
    coordinate: [77.437894, 12.863129],
    type: "academic",
    description: "Administrative and Academic Block",
    hours: "6:00 AM - 10:00 PM",
  },
  {
    id: "second-block",
    name: "Second Block",
    coordinate: [77.438359, 12.862898],
    type: "academic",
    description: "Academic Block",
    hours: "6:00 AM - 10:00 PM",
  },
];
