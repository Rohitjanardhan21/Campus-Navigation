import { CampusPlace } from "@/src/domain/campus";

export type BuildingEntranceType = "main" | "side" | "service" | "accessible";

export type BuildingEntrance = {
  id: string;
  buildingId: CampusPlace["id"];
  name: string;
  coordinate: [number, number];
  type?: BuildingEntranceType;
  accessibility?: boolean;
};

export const BUILDING_ENTRANCES: BuildingEntrance[] = [
  // Example entries (replace with real data)
  {
    id: "firstblock-main",
    buildingId: "first-block",
    name: "Main Entrance",
    coordinate: [77.437817, 12.863162],
    type: "main",
    accessibility: true,
  },
  {
    id: "firstblock-side",
    buildingId: "first-block",
    name: "Side Entrance",
    coordinate: [77.437844, 12.862826],
    type: "side",
    accessibility: true,
  },
];
