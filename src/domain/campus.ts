// src/domain/campus.ts

export type CampusPlaceType =
  | "entrance"
  | "academic"
  | "hostel"
  | "food"
  | "admin";

export interface CampusPlace {
  id: string;
  name: string;
  coordinate: [number, number]; // [longitude, latitude]
  type: CampusPlaceType;
}
