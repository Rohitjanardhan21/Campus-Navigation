import { distance, point } from "@turf/turf";
import { FeatureCollection, LineString } from "geojson";

const SNAP_THRESHOLD_METERS = 1;

export type GraphNode = {
  id: string;
  coord: [number, number];
};
export type GraphEdge = {
  from: string;
  to: string;
  weight: number;
};
export type Graph = {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
};

export function buildGraph(paths: FeatureCollection<LineString>): Graph {
  const nodes: Record<string, GraphNode> = {};
  const edges: GraphEdge[] = [];

  let nodeCounter = 0;

  function findOrCreateNode(coord: [number, number]): string {
    for (const id in nodes) {
      const d = distance(point(nodes[id].coord), point(coord), {
        units: "meters",
      });

      if (d < SNAP_THRESHOLD_METERS) {
        return id;
      }
    }

    const id = `${nodeCounter++}`;
    nodes[id] = { id, coord };
    return id;
  }

  for (const feature of paths.features) {
    const coords = feature.geometry.coordinates;

    for (let i = 1; i < coords.length; i++) {
      const fromCoord: [number, number] = [coords[i - 1][0], coords[i - 1][1]];

      const toCoord: [number, number] = [coords[i][0], coords[i][1]];

      const fromId = findOrCreateNode(fromCoord);
      const toId = findOrCreateNode(toCoord);

      const dist = distance(point(fromCoord), point(toCoord), {
        units: "meters",
      });

      edges.push({ from: fromId, to: toId, weight: dist });
      edges.push({ from: toId, to: fromId, weight: dist });
    }
  }

  return { nodes, edges };
}
