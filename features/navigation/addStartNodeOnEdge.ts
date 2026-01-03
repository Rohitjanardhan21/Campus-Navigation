import { distance, point } from "@turf/turf";
import { Graph } from "./buildGraph";

export function addStartNodeOnEdge(
  graph: Graph,
  snappedCoord: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
): { graph: Graph; startNodeId: string } {
  const startId = "user-start";

  graph.nodes[startId] = {
    id: startId,
    coord: snappedCoord,
  };

  // find node IDs for segment endpoints
  function findNodeNear(
    coord: [number, number],
    graph: Graph,
    toleranceMeters = 0.5
  ) {
    for (const node of Object.values(graph.nodes)) {
      const d = distance(point(coord), point(node.coord), {
        units: "meters",
      });
      if (d <= toleranceMeters) {
        return node;
      }
    }
    return null;
  }

  const startNode = findNodeNear(segmentStart, graph);
  const endNode = findNodeNear(segmentEnd, graph);

  if (!startNode || !endNode) {
    throw new Error("Segment nodes not found in graph");
  }

  const d1 = distance(point(snappedCoord), point(segmentStart), {
    units: "meters",
  });
  const d2 = distance(point(snappedCoord), point(segmentEnd), {
    units: "meters",
  });

  // connect start node to both ends
  graph.edges.push({ from: startId, to: startNode.id, weight: d1 });
  graph.edges.push({ from: startNode.id, to: startId, weight: d1 });

  graph.edges.push({ from: startId, to: endNode.id, weight: d2 });
  graph.edges.push({ from: endNode.id, to: startId, weight: d2 });

  return { graph, startNodeId: startId };
}
