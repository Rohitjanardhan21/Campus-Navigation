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
  // First Block Entrances
  {
    id: "firstblock-entrance-1",
    buildingId: "first-block",
    name: "Entrance 1",
    coordinate: [77.43781337983648, 12.863108003555283],
    type: "main",
    accessibility: true,
  },
  {
    id: "firstblock-entrance-2",
    buildingId: "first-block",
    name: "Entrance 2",
    coordinate: [77.43786352718587, 12.86271003700152],
    type: "side",
    accessibility: true,
  },
  {
    id: "firstblock-north",
    buildingId: "first-block",
    name: "North Entrance",
    coordinate: [77.43811772890825, 12.863324327423555],
    type: "side",
    accessibility: true,
  },
  {
    id: "firstblock-south",
    buildingId: "first-block",
    name: "South Entrance",
    coordinate: [77.43811926109987, 12.862958249011996],
    type: "side",
    accessibility: true,
  },
  // Second Block Entrances
  {
    id: "secondblock-entrance-1",
    buildingId: "second-block",
    name: "Entrance 1",
    coordinate: [77.43820424059095, 12.862588316244242],
    type: "main",
    accessibility: true,
  },
  {
    id: "secondblock-entrance-2",
    buildingId: "second-block",
    name: "Entrance 2",
    coordinate: [77.43818473463404, 12.862934275022837],
    type: "side",
    accessibility: true,
  },
  {
    id: "secondblock-entrance-3",
    buildingId: "second-block",
    name: "Entrance 3",
    coordinate: [77.43847134532768, 12.863183799402876],
    type: "side",
    accessibility: true,
  },
  {
    id: "secondblock-entrance-4",
    buildingId: "second-block",
    name: "Entrance 4",
    coordinate: [77.4384728775193, 12.862836143290878],
    type: "side",
    accessibility: true,
  },
  // Third Block Entrances
  {
    id: "thirdblock-entrance-1",
    buildingId: "third-block",
    name: "Entrance 1",
    coordinate: [77.43870829769997, 12.862691320320891],
    type: "side",
    accessibility: true,
  },
  {
    id: "thirdblock-entrance-2",
    buildingId: "third-block",
    name: "Entrance 2",
    coordinate: [77.43896483273033, 12.86287419163014],
    type: "side",
    accessibility: true,
  },
  {
    id: "thirdblock-entrance-4",
    buildingId: "third-block",
    name: "Entrance 4",
    coordinate: [77.43901132385372, 12.862623171252778],
    type: "side",
    accessibility: true,
  },
  {
    id: "thirdblock-entrance-5",
    buildingId: "third-block",
    name: "Entrance 5",
    coordinate: [77.43902255560408, 12.86255345751215],
    type: "side",
    accessibility: true,
  },
  {
    id: "thirdblock-entrance-6",
    buildingId: "third-block",
    name: "Entrance 6",
    coordinate: [77.43900078346996, 12.862248598091881],
    type: "side",
    accessibility: true,
  },
  {
    id: "fifthblock-entrance-1",
    buildingId: "fifth-block",
    name: "Entrance 1",
    coordinate: [77.4386770768026, 12.861933339021078],
    type: "side",
    accessibility: true,
  },
  {
    id: "sixthblock-entrance-1",
    buildingId: "sixth-block",
    name: "Entrance 1",
    coordinate: [77.439851, 12.862161],
    type: "side",
    accessibility: true,
  },
  // Architecture Block Entrances
  {
    id: "architectureblock-entrance-1",
    buildingId: "architecture-block",
    name: "Entrance 1",
    coordinate: [77.43853742374131, 12.860435432113007],
    type: "side",
    accessibility: true,
  },
  // Chapel Entrances
  {
    id: "chapel-entrance-1",
    buildingId: "chapel",
    name: "Entrance 1",
    coordinate: [77.43776075204681, 12.860283324475347],
    type: "main",
    accessibility: true,
  },
  // PU Block Entrances
  {
    id: "publock-entrance-1",
    buildingId: "pu-block",
    name: "Entrance 1",
    coordinate: [77.43734184049458, 12.860413778981382],
    type: "main",
    accessibility: true,
  },
  {
    id: "publock-entrance-2",
    buildingId: "pu-block",
    name: "Entrance 2",
    coordinate: [77.43674487761888, 12.859997342677957],
    type: "side",
    accessibility: true,
  },
];