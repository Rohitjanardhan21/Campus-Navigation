// Custom Mapbox Style Integration
export const CUSTOM_MAPBOX_CONFIG = {
  // Your custom access token
  accessToken: "pk.eyJ1IjoidmFydW5rbTM2MCIsImEiOiJjbWVpNHA5eGswNjBtMmtxdGxia2cxN2w2In0.f88HMcQt5Lh9ZQGIpeNKug",
  
  // Your custom style URL
  styleUrl: "mapbox://styles/varunkm360/cmk2grhzg00kd01s931qtec1p",
  
  // Alternative styles you can switch between
  availableStyles: [
    {
      id: "custom",
      name: "Custom Campus Style",
      url: "mapbox://styles/varunkm360/cmk2grhzg00kd01s931qtec1p",
      description: "Your custom designed campus map"
    },
    {
      id: "streets",
      name: "Streets",
      url: "mapbox://styles/mapbox/streets-v12",
      description: "Standard street map"
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "mapbox://styles/mapbox/satellite-v9",
      description: "Satellite imagery"
    },
    {
      id: "outdoors",
      name: "Outdoors",
      url: "mapbox://styles/mapbox/outdoors-v12",
      description: "Outdoor activities focused"
    }
  ]
};

// Style configuration for different map elements
export const CUSTOM_STYLE_CONFIG = {
  // Campus-specific layer styling
  campusLayers: {
    // Building styling that works with your custom style
    buildings: {
      fillColor: "#E8F4FD",
      fillOpacity: 0.8,
      strokeColor: "#1A73E8",
      strokeWidth: 1
    },
    
    // Campus boundary styling
    boundary: {
      fillColor: "rgba(26, 115, 232, 0.1)",
      strokeColor: "#1A73E8",
      strokeWidth: 2,
      strokeDasharray: [5, 5]
    },
    
    // Walking paths styling
    paths: {
      strokeColor: "#34A853",
      strokeWidth: 3,
      strokeOpacity: 0.8
    },
    
    // Route styling that complements your custom style
    route: {
      strokeColor: "#EA4335",
      strokeWidth: 6,
      strokeOpacity: 1,
      backgroundStrokeColor: "#FFFFFF",
      backgroundStrokeWidth: 10,
      backgroundStrokeOpacity: 0.8
    }
  },
  
  // Marker styling
  markers: {
    default: {
      color: "#1A73E8",
      size: 12,
      strokeColor: "#FFFFFF",
      strokeWidth: 2
    },
    selected: {
      color: "#EA4335",
      size: 16,
      strokeColor: "#FFFFFF",
      strokeWidth: 3
    },
    userLocation: {
      color: "#4285F4",
      size: 14,
      strokeColor: "#FFFFFF",
      strokeWidth: 2
    }
  }
};

// Function to load local style.json if needed
export const loadLocalStyle = async () => {
  try {
    // If you want to use the local style.json file instead of the URL
    const styleJson = require('@/assets/mapbox/style.json');
    return styleJson;
  } catch (error) {
    console.warn('Local style.json not found, using remote style URL');
    return null;
  }
};

// Enhanced style switching with your custom style as default
export class CustomStyleManager {
  private currentStyleId: string = 'custom';
  
  getCurrentStyle() {
    return CUSTOM_MAPBOX_CONFIG.availableStyles.find(
      style => style.id === this.currentStyleId
    ) || CUSTOM_MAPBOX_CONFIG.availableStyles[0];
  }
  
  switchStyle(styleId: string) {
    const style = CUSTOM_MAPBOX_CONFIG.availableStyles.find(s => s.id === styleId);
    if (style) {
      this.currentStyleId = styleId;
      return style.url;
    }
    return this.getCurrentStyle().url;
  }
  
  getAvailableStyles() {
    return CUSTOM_MAPBOX_CONFIG.availableStyles;
  }
  
  // Get style URL with fallback
  getStyleUrl(styleId?: string) {
    if (styleId) {
      const style = CUSTOM_MAPBOX_CONFIG.availableStyles.find(s => s.id === styleId);
      return style?.url || CUSTOM_MAPBOX_CONFIG.styleUrl;
    }
    return this.getCurrentStyle().url;
  }
}

// Export singleton instance
export const styleManager = new CustomStyleManager();