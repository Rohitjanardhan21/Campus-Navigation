import { distance, point } from "@turf/turf";
import { Graph } from "./buildGraph";

export function findNearestNode(coord: [number, number], graph: Graph): string {
  let nearestId = "";
  let minDist = Infinity;

  for (const id in graph.nodes) {
    const d = distance(point(coord), point(graph.nodes[id].coord), {
      units: "meters",
    });
    if (d < minDist) {
      minDist = d;
      nearestId = id;
    }
  }
  return nearestId;
}
