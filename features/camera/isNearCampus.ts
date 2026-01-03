import { booleanPointInPolygon, distance, point } from "@turf/turf";
import { Feature, Polygon } from "geojson";

export function isNearCampus(
  coord: [number, number],
  campus: Feature<Polygon>,
  maxDistanceMeters = 200
): boolean {
  const pt = point(coord);

  if (booleanPointInPolygon(pt, campus)) {
    return true;
  }

  const campuscenter = campus.geometry.coordinates[0][0];
  const d = distance(pt, point(campuscenter), { units: "meters" });

  return d <= maxDistanceMeters;
}
