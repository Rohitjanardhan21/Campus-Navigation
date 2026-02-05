import { Graph } from "./buildGraph";

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string
): string[] {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id in graph.nodes) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }

  distances[startId] = 0;

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );

    if (current == endId) break;

    unvisited.delete(current);

    const neighbors = graph.edges.filter((e) => e.from === current);

    for (const edge of neighbors) {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = current;
      }
    }
  }

  const path: string[] = [];
  if (distances[endId] === Infinity) {
    return path;
  }
  let current: string | null = endId;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }
  return path;
}
