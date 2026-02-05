import { CUSTOM_STYLE_CONFIG } from "@/services/customMapboxStyle";
import { CAMPUS_BOUNDARY } from "@/src/data/geo/campusBoundary";
import Mapbox from "@rnmapbox/maps";

export function CampusBoundaryLayer() {
  return (
    <Mapbox.ShapeSource id="campus-boundary" shape={CAMPUS_BOUNDARY}>
      <Mapbox.FillLayer
        id="campus-boundary-fill"
        style={{
          fillColor: CUSTOM_STYLE_CONFIG.campusLayers.boundary.fillColor,
          fillOpacity: 0.1,
        }}
      />
      <Mapbox.LineLayer
        id="campus-boundary-line"
        style={{
          lineColor: CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeColor,
          lineWidth: CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeWidth,
          lineDasharray:
            CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeDasharray,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
