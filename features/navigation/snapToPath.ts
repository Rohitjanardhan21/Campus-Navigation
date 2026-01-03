import { nearestPointOnLine, point } from "@turf/turf";
import { FeatureCollection, LineString } from "geojson";

export function snapToPathsWithSegment(
  userLocation: [number, number],
  paths: FeatureCollection<LineString>
) {
  let best: {
    snappedCoord: [number, number];
    line: [number, number][];
    index: number;
  } | null = null;

  let minDist = Infinity;

  for (const feature of paths.features) {
    const snapped = nearestPointOnLine(feature, point(userLocation));

    const dist = snapped.properties?.dist;
    const idx = snapped.properties?.index;

    if (dist == null || idx == null) continue;

    if (dist < minDist) {
      const line = feature.geometry.coordinates as [number, number][];

      // Normalize index to ALWAYS represent a valid segment
      let segmentIndex = idx;

      if (segmentIndex >= line.length - 1) {
        segmentIndex = line.length - 2;
      }

      if (segmentIndex < 0) {
        segmentIndex = 0;
      }

      best = {
        snappedCoord: snapped.geometry.coordinates as [number, number],
        line,
        index: segmentIndex,
      };

      minDist = dist;
    }
  }

  if (!best) {
    throw new Error("No path found to snap");
  }

  return best;
}
