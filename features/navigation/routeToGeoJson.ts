import { Feature, LineString } from "geojson";
import { Graph } from "./buildGraph";

export function routeToGeoJSON(
  route: string[],
  graph: Graph
): Feature<LineString> {
  const coordinates: [number, number][] = route.map(
    (nodeId) => graph.nodes[nodeId].coord
  );
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {},
  };
}
