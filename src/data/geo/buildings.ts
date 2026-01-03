import { FeatureCollection, Polygon } from "geojson";

export const CAMPUS_BUILDINGS: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "library",
        name: "Central Library",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.6038, 12.9348],
            [77.604, 12.9348],
            [77.604, 12.935],
            [77.6038, 12.935],
            [77.6038, 12.9348],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "canteen",
        name: "Canteen",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.603, 12.9333],
            [77.6032, 12.9333],
            [77.6032, 12.9335],
            [77.603, 12.9335],
            [77.603, 12.9333],
          ],
        ],
      },
    },
  ],
};
