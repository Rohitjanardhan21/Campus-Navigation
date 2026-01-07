// Enhanced Mapbox data service - accessing more data types
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 
  "pk.eyJ1IjoiYmVyaWNrcyIsImEiOiJjbWVkMmxhdDIwNXdyMmxzNTA3ZnprMHk3In0.hE8cQigI9JFbb9YBHnOsHQ";

export class MapboxDataService {
  
  // 🔍 GEOCODING - Convert addresses to coordinates
  static async geocodeAddress(address: string, campusBounds?: [number, number, number, number]) {
    const bbox = campusBounds ? `&bbox=${campusBounds.join(',')}` : '';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?types=poi,address${bbox}&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      name: feature.place_name,
      coordinate: feature.center as [number, number],
      address: feature.properties?.address,
      category: feature.properties?.category,
      confidence: feature.relevance
    }));
  }

  // 🔄 REVERSE GEOCODING - Convert coordinates to address
  static async reverseGeocode(coordinate: [number, number]) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate[0]},${coordinate[1]}.json?types=poi,address&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.features.length > 0) {
      const feature = data.features[0];
      return {
        address: feature.place_name,
        components: feature.context?.reduce((acc: any, ctx: any) => {
          acc[ctx.id.split('.')[0]] = ctx.text;
          return acc;
        }, {})
      };
    }
    return null;
  }

  // 🕐 ISOCHRONE - Show reachable areas within time
  static async getReachableArea(
    coordinate: [number, number], 
    minutes: number[] = [5, 10, 15],
    profile: 'walking' | 'driving' | 'cycling' = 'walking'
  ) {
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${coordinate[0]},${coordinate[1]}?contours_minutes=${minutes.join(',')}&polygons=true&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      timeMinutes: feature.properties.contour,
      area: feature.geometry,
      color: feature.properties.color
    }));
  }

  // 📊 MATRIX API - Calculate travel times between multiple points
  static async getTravelMatrix(
    coordinates: [number, number][],
    profile: 'walking' | 'driving' | 'cycling' = 'walking'
  ) {
    const coordString = coordinates.map(coord => coord.join(',')).join(';');
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordString}?access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      durations: data.durations, // Travel times in seconds
      distances: data.distances, // Distances in meters
      coordinates: coordinates
    };
  }

  // 🖼️ STATIC MAP - Generate map image
  static generateStaticMap(
    coordinate: [number, number],
    zoom: number = 15,
    size: [number, number] = [300, 200],
    markers?: Array<{coordinate: [number, number], color?: string, size?: 's'|'m'|'l'}>
  ) {
    let markerString = '';
    if (markers) {
      markerString = markers.map(marker => 
        `pin-${marker.size || 's'}-${marker.color || '000'}(${marker.coordinate[0]},${marker.coordinate[1]})`
      ).join(',');
    }
    
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markerString}/${coordinate[0]},${coordinate[1]},${zoom},0/${size[0]}x${size[1]}?access_token=${MAPBOX_TOKEN}`;
  }

  // 🏢 BUILDING DATA - Extract building information from vector tiles
  static async getBuildingData(bounds: [number, number, number, number], zoom: number = 15) {
    // This requires Mapbox Tiling Service or custom tileset
    // For now, we'll use a placeholder structure
    return {
      buildings: [
        {
          id: 'building_1',
          geometry: {
            type: 'Polygon',
            coordinates: [[[bounds[0], bounds[1]], [bounds[2], bounds[1]], [bounds[2], bounds[3]], [bounds[0], bounds[3]], [bounds[0], bounds[1]]]]
          },
          properties: {
            name: 'Academic Building',
            height: 25,
            levels: 3,
            type: 'education'
          }
        }
      ]
    };
  }

  // 🛣️ ROAD NETWORK - Get road and path data
  static async getRoadNetwork(bounds: [number, number, number, number]) {
    // This would typically come from vector tiles
    // Placeholder structure for road data
    return {
      roads: [
        {
          geometry: {
            type: 'LineString',
            coordinates: [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
          },
          properties: {
            name: 'Campus Drive',
            highway: 'residential',
            surface: 'paved',
            pedestrian: true
          }
        }
      ],
      paths: [
        {
          geometry: {
            type: 'LineString',
            coordinates: [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
          },
          properties: {
            highway: 'footway',
            surface: 'concrete',
            lit: true,
            wheelchair: 'yes'
          }
        }
      ]
    };
  }

  // 📍 POI SEARCH - Find points of interest
  static async searchPOI(
    query: string,
    coordinate: [number, number],
    radius: number = 1000, // meters
    categories?: string[]
  ) {
    const bbox = [
      coordinate[0] - 0.01, coordinate[1] - 0.01,
      coordinate[0] + 0.01, coordinate[1] + 0.01
    ];
    
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=poi&bbox=${bbox.join(',')}&access_token=${MAPBOX_TOKEN}`;
    
    if (categories) {
      url += `&category=${categories.join(',')}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.text,
      fullName: feature.place_name,
      coordinate: feature.center as [number, number],
      category: feature.properties?.category,
      address: feature.properties?.address,
      phone: feature.properties?.tel,
      website: feature.properties?.website,
      hours: feature.properties?.hours
    }));
  }

  // 🌦️ WEATHER OVERLAY (if available)
  static async getWeatherData(coordinate: [number, number]) {
    // This would integrate with weather services
    // Placeholder for weather data structure
    return {
      temperature: 22,
      conditions: 'sunny',
      precipitation: 0,
      visibility: 10000,
      windSpeed: 5,
      windDirection: 180
    };
  }

  // 🚦 TRAFFIC DATA (if available)
  static async getTrafficData(coordinate: [number, number], radius: number = 1000) {
    // This would come from Mapbox Traffic API
    // Placeholder structure
    return {
      congestion: 'low' as 'low' | 'moderate' | 'heavy' | 'severe',
      incidents: [
        {
          type: 'construction',
          location: coordinate,
          description: 'Road work ahead',
          severity: 'minor'
        }
      ]
    };
  }
}

// Usage examples:
export const mapboxExamples = {
  // Search for campus locations
  searchCampus: async () => {
    const results = await MapboxDataService.geocodeAddress(
      'library university campus',
      [77.45, 12.92, 77.51, 12.96] // Campus bounds
    );
    return results;
  },

  // Show 5-minute walking area
  showWalkingArea: async (location: [number, number]) => {
    const areas = await MapboxDataService.getReachableArea(location, [5]);
    return areas[0]; // 5-minute walking area
  },

  // Find nearest cafeterias
  findFood: async (location: [number, number]) => {
    const pois = await MapboxDataService.searchPOI('food', location, 500, ['food_and_drink']);
    return pois;
  },

  // Generate map thumbnail
  createThumbnail: (location: [number, number]) => {
    return MapboxDataService.generateStaticMap(location, 16, [400, 300], [
      { coordinate: location, color: 'f00', size: 'm' }
    ]);
  }
};