import { FeatureCollection, LineString } from "geojson";

export const CAMPUS_PATHS: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "main-path",
        name: "Main Walkway",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.6035, 12.9342], // near Main Gate
          [77.6038, 12.9346],
          [77.6041, 12.9349], // near Library
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "canteen-path",
        name: "Canteen Path",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.6038, 12.9346],
          [77.6032, 12.9334], // near Canteen
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "junction-path",
        name: "Shortcut Path",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.6038, 12.9346], // junction point (shared)
          [77.6043, 12.9353], // shortcut destination
        ],
      },
    },
  ],
};
