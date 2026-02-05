import { useLocation } from "@/hooks/useLocation";
import { CUSTOM_MAPBOX_CONFIG } from "@/services/customMapboxStyle";
import { CAMPUS_PLACES } from "@/src/data/campusPlaces";
import { CAMPUS_PATHS } from "@/src/data/geo/paths";

import { CampusBoundaryLayer } from "@/src/map/layers/CampusBoundaryLayer";
import { CampusBuildingsLayer } from "@/src/map/layers/CampusBuildingsLayer";
import { MapCamera } from "@/src/map/MapCamera";
import { MapViewContainer } from "@/src/map/MapViewContainer";

import Mapbox from "@rnmapbox/maps";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function MapScreen() {
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  const { userLocation } = useLocation();

  const [mapStyle] = useState(CUSTOM_MAPBOX_CONFIG.styleUrl);
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState<
    (typeof CAMPUS_PLACES)[0] | null
  >(null);

  const handleBuildingPress = (feature: any) => {
    const placeId = feature?.properties?.placeId;
    if (!placeId) return;

    const place = CAMPUS_PLACES.find((p) => p.id === placeId);
    if (!place) return;

    setSelectedPlace(place);
    console.log("SELECTED PLACE:", place.name);
  };

  useEffect(() => {
    if (userLocation && cameraRef.current && !hasCenteredOnUser) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 16,
        animationDuration: 1200,
      });

      setHasCenteredOnUser(true);
    }
  }, [userLocation, hasCenteredOnUser]);

  return (
    <View style={styles.container}>
      <MapViewContainer mapRef={mapRef} styleURL={mapStyle}>
        <MapCamera
          cameraRef={cameraRef}
          centerCoordinate={[77.48, 12.94]}
          zoomLevel={16}
        />

        <CampusBoundaryLayer />

        {/* 🔹 PATHS LAYER (JUST RENDERING) */}
        <Mapbox.ShapeSource id="campus-paths" shape={CAMPUS_PATHS}>
          <Mapbox.LineLayer
            id="campus-paths-line"
            style={{
              lineColor: "#EA4335",
              lineWidth: 4,
              lineOpacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </Mapbox.ShapeSource>

        <CampusBuildingsLayer onBuildingPress={handleBuildingPress} />

        <Mapbox.UserLocation visible />
      </MapViewContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
