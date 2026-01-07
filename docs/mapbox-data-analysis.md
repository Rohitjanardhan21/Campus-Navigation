# 🗺️ Mapbox Data Analysis - What We Have Access To

## 📊 **Currently Using in Our App**

### ✅ **1. Mapbox Directions API**
**Endpoint:** `https://api.mapbox.com/directions/v5/mapbox/walking/`

**Data We Get:**
```json
{
  "routes": [{
    "geometry": {
      "coordinates": [[lng, lat], [lng, lat], ...], // Route path points
      "type": "LineString"
    },
    "legs": [{
      "steps": [{
        "maneuver": {
          "instruction": "Head north on Main St",     // Turn-by-turn instructions
          "type": "depart|turn|arrive",               // Maneuver type
          "modifier": "left|right|straight",          // Direction modifier
          "location": [lng, lat]                      // Exact maneuver point
        },
        "geometry": {
          "coordinates": [[lng, lat], ...]            // Step geometry
        },
        "distance": 150,                              // Step distance in meters
        "duration": 120                               // Step duration in seconds
      }],
      "distance": 1500,                               // Leg distance in meters
      "duration": 1200                                // Leg duration in seconds
    }],
    "distance": 1500,                                 // Total route distance
    "duration": 1200                                  // Total route duration
  }]
}
```

### ✅ **2. Mapbox Maps SDK**
**What We Get:**
- Base map tiles (streets, satellite, terrain)
- Vector map data
- Real-time map rendering
- User location services
- Map interactions (zoom, pan, rotate)

---

## 🌍 **Available Mapbox Data Sources (Not Currently Used)**

### **1. 🔍 Geocoding API**
**What It Provides:**
```javascript
// Forward Geocoding: Address → Coordinates
const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/Main%20Library.json?access_token=${token}`;

// Response Data:
{
  "features": [{
    "place_name": "Main Library, University Campus, City, State",
    "center": [lng, lat],                    // Exact coordinates
    "geometry": { "coordinates": [lng, lat] },
    "properties": {
      "address": "123 Campus Drive",
      "category": "education",
      "maki": "library"                      // Icon suggestion
    },
    "context": [                             // Hierarchical location data
      { "id": "neighborhood", "text": "Campus" },
      { "id": "place", "text": "City" },
      { "id": "region", "text": "State" }
    ]
  }]
}

// Reverse Geocoding: Coordinates → Address
const reverseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
```

### **2. 🕐 Isochrone API**
**What It Provides:**
```javascript
// Reachable areas within time/distance
const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${lng},${lat}?contours_minutes=5,10,15&access_token=${token}`;

// Response Data:
{
  "features": [{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[lng, lat], ...]]     // Area reachable in 5 minutes
    },
    "properties": {
      "contour": 5,                          // Minutes
      "color": "#bf04c2"                     // Suggested color
    }
  }]
}
```

### **3. 📊 Matrix API**
**What It Provides:**
```javascript
// Travel times/distances between multiple points
const matrixUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${coordinates}?access_token=${token}`;

// Response Data:
{
  "durations": [                             // Travel times matrix
    [0, 300, 600],                          // From point 0 to all points
    [300, 0, 400],                          // From point 1 to all points
    [600, 400, 0]                           // From point 2 to all points
  ],
  "distances": [                             // Distance matrix
    [0, 500, 1000],
    [500, 0, 700],
    [1000, 700, 0]
  ]
}
```

### **4. 🖼️ Static Images API**
**What It Provides:**
```javascript
// Generate map images
const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+000(${lng},${lat})/${lng},${lat},15,0/300x200?access_token=${token}`;

// Returns: PNG/JPG image of the map
```

### **5. 🗺️ Tilesets API**
**What It Provides:**
```javascript
// Custom map data layers
const tilesetUrl = `https://api.mapbox.com/tilesets/v1/{username}/{tileset_id}?access_token=${token}`;

// Response: Vector tiles with custom data
{
  "type": "vector",
  "tiles": ["https://api.mapbox.com/v4/{tileset_id}/{z}/{x}/{y}.vector.pbf"],
  "minzoom": 0,
  "maxzoom": 14
}
```

### **6. 🛰️ Satellite/Aerial Imagery**
**What It Provides:**
- High-resolution satellite imagery
- Aerial photography
- Historical imagery (in some areas)
- Real-time updates

---

## 🏫 **Campus-Specific Data We Can Extract**

### **1. 🏢 Building Footprints**
```javascript
// From Mapbox vector tiles
const buildingData = {
  "type": "FeatureCollection",
  "features": [{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[lng, lat], ...]]     // Building outline
    },
    "properties": {
      "name": "Engineering Building",
      "height": 45,                          // Building height
      "levels": 4,                           // Number of floors
      "type": "education"
    }
  }]
}
```

### **2. 🛣️ Road Network**
```javascript
// Street and path data
const roadData = {
  "features": [{
    "geometry": {
      "type": "LineString",
      "coordinates": [[lng, lat], ...]       // Road centerline
    },
    "properties": {
      "name": "Campus Drive",
      "highway": "residential",
      "surface": "paved",
      "width": 6,                            // Road width in meters
      "oneway": false,
      "pedestrian": true                     // Pedestrian access
    }
  }]
}
```

### **3. 🚶 Pedestrian Paths**
```javascript
const pathData = {
  "features": [{
    "geometry": {
      "type": "LineString", 
      "coordinates": [[lng, lat], ...]
    },
    "properties": {
      "highway": "footway",
      "surface": "concrete",
      "lit": true,                           // Lighting available
      "covered": false,                      // Covered walkway
      "wheelchair": "yes"                    // Accessibility
    }
  }]
}
```

### **4. 🌳 Land Use & Areas**
```javascript
const landUseData = {
  "features": [{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[lng, lat], ...]]
    },
    "properties": {
      "landuse": "education",               // Land use type
      "name": "University Campus",
      "amenity": "university",
      "operator": "University Name"
    }
  }]
}
```

---

## 📍 **Points of Interest (POI) Data**

### **Available POI Categories:**
```javascript
const poiCategories = {
  "education": ["school", "university", "library"],
  "food": ["restaurant", "cafe", "fast_food"],
  "healthcare": ["hospital", "clinic", "pharmacy"],
  "transportation": ["bus_stop", "parking", "bicycle_parking"],
  "recreation": ["park", "playground", "sports_centre"],
  "services": ["atm", "bank", "post_office"],
  "retail": ["shop", "supermarket", "convenience"]
};

// POI Data Structure:
{
  "geometry": { "coordinates": [lng, lat] },
  "properties": {
    "name": "Campus Bookstore",
    "amenity": "shop",
    "shop": "books",
    "opening_hours": "Mo-Fr 08:00-18:00",
    "phone": "+1234567890",
    "website": "https://bookstore.university.edu"
  }
}
```

---

## 🔄 **Real-Time Data Available**

### **1. Traffic Data**
```javascript
// Current traffic conditions
const trafficData = {
  "congestion": "low|moderate|heavy|severe",
  "speed": 25,                              // Current speed km/h
  "incidents": [{
    "type": "construction",
    "location": [lng, lat],
    "description": "Road work ahead"
  }]
}
```

### **2. Weather Integration**
```javascript
// Weather overlay data
const weatherData = {
  "temperature": 22,                        // Celsius
  "conditions": "sunny",
  "precipitation": 0,                       // mm/hour
  "visibility": 10000                       // meters
}
```

---

## 💡 **What We Can Implement Next**

### **🎯 High Priority (Easy to Implement):**

1. **Geocoding for Search**
```javascript
// Add to search functionality
const searchWithGeocoding = async (query) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?` +
    `bbox=77.45,12.92,77.51,12.96&` +  // Limit to campus area
    `types=poi&` +                      // Points of interest only
    `access_token=${token}`
  );
  return response.json();
};
```

2. **Isochrone Visualization**
```javascript
// Show reachable areas
const showReachableAreas = async (location, minutes) => {
  const response = await fetch(
    `https://api.mapbox.com/isochrone/v1/mapbox/walking/${location[0]},${location[1]}?` +
    `contours_minutes=${minutes}&` +
    `access_token=${token}`
  );
  // Display as colored overlay on map
};
```

3. **Static Map Thumbnails**
```javascript
// Generate preview images
const generateMapThumbnail = (location, zoom = 15) => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
         `pin-s-l+000(${location[0]},${location[1]})/` +
         `${location[0]},${location[1]},${zoom},0/300x200?` +
         `access_token=${token}`;
};
```

### **🚀 Medium Priority (Requires More Work):**

1. **Matrix API for Optimal Routes**
2. **Custom Campus Tileset**
3. **Real-time Traffic Integration**
4. **Weather Overlay**

---

## 📊 **Data Usage Summary**

| **Data Source** | **Currently Used** | **Available** | **Potential Use** |
|-----------------|-------------------|---------------|-------------------|
| Directions API | ✅ Walking routes | 🚗 Driving, 🚲 Cycling | Multi-modal routing |
| Maps SDK | ✅ Basic map | 🎨 Custom styles | Campus-themed maps |
| Geocoding | ❌ | ✅ Address search | Enhanced search |
| Isochrone | ❌ | ✅ Reachable areas | Time-based planning |
| Matrix API | ❌ | ✅ Multi-point routing | Optimal tour planning |
| Static Images | ❌ | ✅ Map thumbnails | Sharing, previews |
| POI Data | ❌ | ✅ Rich POI info | Enhanced place details |
| Building Data | ❌ | ✅ Footprints | Indoor navigation prep |

**Current Usage:** ~20% of available Mapbox data
**Potential:** 80% more features available to implement!