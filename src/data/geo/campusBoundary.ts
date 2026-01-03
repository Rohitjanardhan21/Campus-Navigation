import { Feature, Polygon } from "geojson";
export const CAMPUS_BOUNDARY: Feature<Polygon> = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [77.6025, 12.9335],
        [77.6055, 12.9335],
        [77.6055, 12.936],
        [77.6025, 12.936],
        [77.6025, 12.9335],
      ],
    ],
  },
  properties: {
    name: "Campus Boundary",
  },
};
