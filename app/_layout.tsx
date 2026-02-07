// app/_layout.tsx
import { NavigationHistoryProvider } from "@/contexts/NavigationHistoryContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
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
    <SettingsProvider>
      <NavigationHistoryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </NavigationHistoryProvider>
    </SettingsProvider>
  );
}
