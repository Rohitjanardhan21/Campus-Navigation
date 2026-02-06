import { CUSTOM_STYLE_CONFIG } from "@/services/customMapboxStyle";
import { BUILDINGS } from "@/src/data/geo/buildings";
import Mapbox from "@rnmapbox/maps";

type Props = {
  onBuildingPress?: (feature: any, event: any) => void;
};

export function CampusBuildingsLayer({ onBuildingPress }: Props) {
  return (
    <Mapbox.ShapeSource
      id="campus-buildings"
      shape={BUILDINGS}
      onPress={(e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        onBuildingPress?.(feature, e);
      }}
    >
      <Mapbox.FillLayer
        id="campus-building-fill"
        style={{
          fillColor: CUSTOM_STYLE_CONFIG.campusLayers.buildings.fillColor,
          fillOpacity: CUSTOM_STYLE_CONFIG.campusLayers.buildings.fillOpacity,
        }}
      />
      <Mapbox.LineLayer
        id="campus-building-outline"
        style={{
          lineColor: CUSTOM_STYLE_CONFIG.campusLayers.buildings.strokeColor,
          lineWidth: CUSTOM_STYLE_CONFIG.campusLayers.buildings.strokeWidth,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
