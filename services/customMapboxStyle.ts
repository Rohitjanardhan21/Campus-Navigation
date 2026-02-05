// customMapboxStyle.ts
// Centralized Mapbox style + campus overlay configuration

/**
 * Mapbox style configuration
 * NOTE:
 * - Mapbox Studio owns base map styling
 * - App owns campus overlays (GeoJSON layers)
 */

export const CUSTOM_MAPBOX_CONFIG = {
  /**
   * Primary campus style (Mapbox Studio)
   */
  styleUrl: "mapbox://styles/bericks/cmkhz0mno003e01sg4xhi6rvm",

  /**
   * Optional styles (for future switching / debugging)
   * These do NOT affect campus locking logic
   */
  availableStyles: [
    {
      id: "custom",
      name: "Custom Campus Style",
      url: "mapbox://styles/bericks/cmkhz0mno003e01sg4xhi6rvm",
      description: "Clean campus-focused base map",
    },
    {
      id: "streets",
      name: "Streets",
      url: "mapbox://styles/mapbox/streets-v12",
      description: "Standard Mapbox streets",
    },
    {
      id: "outdoors",
      name: "Outdoors",
      url: "mapbox://styles/mapbox/outdoors-v12",
      description: "Outdoor-focused map",
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "mapbox://styles/mapbox/satellite-v9",
      description: "Satellite imagery",
    },
  ],
};

/**
 * Styling for APP-OWNED GeoJSON layers
 * These styles DO NOT modify the base map
 */
export const CUSTOM_STYLE_CONFIG = {
  campusLayers: {
    /**
     * Campus boundary (visual cue only)
     */
    boundary: {
      fillColor: "rgba(26, 115, 232, 0.1)",
      strokeColor: "#1A73E8",
      strokeWidth: 2,
      strokeDasharray: [5, 5],
    },

    /**
     * 2D campus buildings (navigation & interaction)
     */
    buildings: {
      fillColor: "#E8F4FD",
      fillOpacity: 0.8,
      strokeColor: "#1A73E8",
      strokeWidth: 1,
    },

    /**
     * Campus walking paths
     */
    paths: {
      strokeColor: "#34A853",
      strokeWidth: 3,
      strokeOpacity: 0.8,
    },

    /**
     * Navigation route (future use)
     */
    route: {
      strokeColor: "#EA4335",
      strokeWidth: 6,
      strokeOpacity: 1,
      backgroundStrokeColor: "#FFFFFF",
      backgroundStrokeWidth: 10,
      backgroundStrokeOpacity: 0.8,
    },
  },

  /**
   * Marker styling (future use)
   */
  markers: {
    default: {
      color: "#1A73E8",
      size: 12,
      strokeColor: "#FFFFFF",
      strokeWidth: 2,
    },
    selected: {
      color: "#EA4335",
      size: 16,
      strokeColor: "#FFFFFF",
      strokeWidth: 3,
    },
    userLocation: {
      color: "#4285F4",
      size: 14,
      strokeColor: "#FFFFFF",
      strokeWidth: 2,
    },
  },
};

/**
 * Style manager
 * Handles base map style selection only
 */
class CustomStyleManager {
  private currentStyleId: string = "custom";

  getCurrentStyle() {
    return (
      CUSTOM_MAPBOX_CONFIG.availableStyles.find(
        (style) => style.id === this.currentStyleId,
      ) ?? CUSTOM_MAPBOX_CONFIG.availableStyles[0]
    );
  }

  /**
   * Switch base map style (optional feature)
   */
  switchStyle(styleId: string) {
    const style = CUSTOM_MAPBOX_CONFIG.availableStyles.find(
      (s) => s.id === styleId,
    );

    if (style) {
      this.currentStyleId = styleId;
      return style.url;
    }

    return this.getCurrentStyle().url;
  }

  /**
   * Get active style URL
   * Used directly by <Mapbox.MapView />
   */
  getStyleUrl(styleId?: string) {
    if (styleId) {
      const style = CUSTOM_MAPBOX_CONFIG.availableStyles.find(
        (s) => s.id === styleId,
      );
      return style?.url ?? CUSTOM_MAPBOX_CONFIG.styleUrl;
    }

    return this.getCurrentStyle().url;
  }

  getAvailableStyles() {
    return CUSTOM_MAPBOX_CONFIG.availableStyles;
  }
}

/**
 * Singleton instance
 */
export const styleManager = new CustomStyleManager();
