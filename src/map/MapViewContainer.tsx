import Mapbox from "@rnmapbox/maps";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  mapRef: React.RefObject<Mapbox.MapView | null>;

  styleURL: string;
  onPress?: (e: any) => void;
};

export function MapViewContainer({
  children,
  mapRef,
  styleURL,
  onPress,
}: Props) {
  return (
    <Mapbox.MapView
      ref={mapRef}
      style={{ flex: 1 }}
      styleURL={styleURL}
      onPress={onPress}
    >
      {children}
    </Mapbox.MapView>
  );
}
