// src/domain/campus.ts

export type CampusPlaceType =
  | "entrance"
  | "academic"
  | "hostel"
  | "canteen"
  | "admin"
  | "sports"
  | "medical"
  | "services"
  | "parking"
  | "garden"
  | "landmark";

export interface CampusPlace {
  id: string;
  name: string;
  coordinate: [number, number]; // [longitude, latitude]
  type: CampusPlaceType;
  description?: string;
  hours?: string;
  floors?: number;
  accessibility?: boolean;
}
