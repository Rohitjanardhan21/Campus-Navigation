import Mapbox from "@rnmapbox/maps";
import React from "react";

type Props = {
  cameraRef: React.RefObject<Mapbox.Camera | null>;
  centerCoordinate: [number, number];
  zoomLevel: number;
};

export function MapCamera({ cameraRef, centerCoordinate, zoomLevel }: Props) {
  return (
    <Mapbox.Camera
      ref={cameraRef}
      defaultSettings={{
        centerCoordinate,
        zoomLevel,
      }}
    />
  );
}
