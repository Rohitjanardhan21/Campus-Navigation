import { CAMPUS_PATHS } from "@/src/data/geo/paths";
import { CampusPlace } from "@/src/domain/campus";
import { Feature, LineString } from "geojson";
import { distance as turfDistance, point } from "@turf/turf";
import { NavigationStep } from "@/features/navigation/mapboxRouting";
import { addStartNodeOnEdge } from "./addStartNodeOnEdge";
import { buildGraph, Graph } from "./buildGraph";
import { dijkstra } from "./dijkstra";
import { findNearestNode } from "./findNearestNode";
import { generateInstructions } from "./generateInstructions";
import { routeToGeoJSON } from "./routeToGeoJson";
import { snapToPathsWithSegment } from "./snapToPath";

export interface CampusRoute {
  coordinates: [number, number][];
  duration: number; // minutes
  distance: number; // km
  feature: Feature<LineString>;
  steps: NavigationStep[];
}

const WALKING_SPEED_MPS = 1.4;

const BASE_GRAPH = buildGraph(CAMPUS_PATHS);

const cloneGraph = (graph: Graph): Graph => ({
  nodes: Object.fromEntries(
    Object.entries(graph.nodes).map(([id, node]) => [id, { ...node }]),
  ),
  edges: graph.edges.map((edge) => ({ ...edge })),
});

const distanceMeters = (a: [number, number], b: [number, number]) =>
  turfDistance(point(a), point(b), { units: "meters" });

export const getCampusRoute = async (
  startCoord: [number, number],
  endCoord: [number, number],
  destination?: CampusPlace
): Promise<CampusRoute | null> => {
  let startSnap: ReturnType<typeof snapToPathsWithSegment>;
  let endSnap: ReturnType<typeof snapToPathsWithSegment>;

  try {
    startSnap = snapToPathsWithSegment(startCoord, CAMPUS_PATHS);
    endSnap = snapToPathsWithSegment(endCoord, CAMPUS_PATHS);
  } catch (error) {
    console.error("Campus routing: failed to snap to paths.", error);
    return null;
  }

  const segmentStart = startSnap.line[startSnap.index];
  const segmentEnd = startSnap.line[startSnap.index + 1];
  const endSegmentStart = endSnap.line[endSnap.index];
  const endSegmentEnd = endSnap.line[endSnap.index + 1];

  let workingGraph = cloneGraph(BASE_GRAPH);
  let startId = findNearestNode(startCoord, workingGraph);
  let endId = findNearestNode(endCoord, workingGraph);

  try {
    const graphWithStart = addStartNodeOnEdge(
      workingGraph,
      startSnap.snappedCoord,
      segmentStart,
      segmentEnd,
      "user-start"
    );
    workingGraph = graphWithStart.graph;
    startId = graphWithStart.startNodeId;
  } catch (error) {
    console.warn("Campus routing: failed to add start node, using nearest.", error);
  }

  try {
    const graphWithEnd = addStartNodeOnEdge(
      workingGraph,
      endSnap.snappedCoord,
      endSegmentStart,
      endSegmentEnd,
      "user-end"
    );
    workingGraph = graphWithEnd.graph;
    endId = graphWithEnd.startNodeId;
  } catch (error) {
    console.warn("Campus routing: failed to add end node, using nearest.", error);
  }

  const routeNodeIds = dijkstra(workingGraph, startId, endId);

  if (!routeNodeIds || routeNodeIds.length < 2) {
    console.error(
      "Campus routing: no connected path found. Check path connectivity or snap threshold."
    );
    return null;
  }

  const feature = routeToGeoJSON(routeNodeIds, workingGraph);
  const coordinates = feature.geometry.coordinates as [number, number][];

  let totalMeters = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalMeters += distanceMeters(coordinates[i], coordinates[i + 1]);
  }

  const destinationPlace: CampusPlace = destination ?? {
    id: "custom-destination",
    name: "Destination",
    coordinate: endCoord,
    type: "academic",
  };

  const steps = generateInstructions(
    coordinates,
    destinationPlace
  ) as NavigationStep[];

  return {
    coordinates,
    duration: Math.round(totalMeters / WALKING_SPEED_MPS / 60),
    distance: parseFloat((totalMeters / 1000).toFixed(2)),
    feature,
    steps,
  };
};
