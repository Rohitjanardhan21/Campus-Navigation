import Constants from "expo-constants";

export const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error(
    "❌ Mapbox token missing. Set EXPO_PUBLIC_MAPBOX_TOKEN in .env"
  );
}
