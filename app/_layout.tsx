// app/_layout.tsx
import { MAPBOX_TOKEN } from "@/services/config";
import Mapbox from "@rnmapbox/maps";
import { Stack } from "expo-router";

try {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
} catch (e) {
  console.log("Mapbox token error:", e);
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
