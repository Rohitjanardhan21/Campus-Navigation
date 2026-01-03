# Campus Navigation App

A modern, TypeScript-based campus navigation app built with Expo and React Native. Features graph-based routing using Dijkstra's algorithm, real-time location tracking, and an intuitive UI.

## Features

### Core Navigation

- **Graph-based routing**: Uses Dijkstra's algorithm for optimal pathfinding
- **Real-time location tracking**: Continuous GPS updates with campus boundary validation
- **Path snapping**: Automatically snaps user location to nearest campus path
- **Route visualization**: Interactive map with route display and turn-by-turn guidance

### User Interface

- **Futuristic Search Bar**: Search for places with real-time filtering
- **Enhanced Navigation Panel**: Shows travel time, distance, and ETA
- **Smart Floating Buttons**: Quick access to zoom, map styles, and location
- **Place Details Modal**: View detailed information about campus locations
- **Settings & Menu**: Comprehensive app settings and menu system

### Advanced Features

- **Voice Guidance**: Turn-by-turn voice instructions (expo-speech)
- **Multiple Map Styles**: Switch between street, satellite, and outdoor views
- **Campus Boundary Detection**: Automatically disables navigation outside campus
- **Place Markers**: Visual markers for all campus locations
- **Route Sharing**: Share navigation details with others

## Tech Stack

- **Framework**: Expo ~54.0.29
- **Language**: TypeScript 5.9.2
- **Maps**: @rnmapbox/maps 10.2.10
- **Geospatial**: @turf/turf 7.3.1
- **Navigation**: Graph-based Dijkstra algorithm
- **UI**: React Native with custom components

## Project Structure

```
Nav/
├── app/                    # Expo Router pages
│   └── (tabs)/
│       └── map.tsx         # Main map screen
├── components/            # Reusable UI components
│   ├── SearchBar.tsx
│   ├── SearchResults.tsx
│   ├── NavigationPanel.tsx
│   ├── FloatingButtons.tsx
│   ├── PlaceDetailsModal.tsx
│   ├── MenuModal.tsx
│   └── SettingsModal.tsx
├── hooks/                 # Custom React hooks
│   ├── useLocation.ts
│   ├── useSearch.ts
│   └── useNavigation.ts
├── features/              # Feature modules
│   ├── camera/           # Camera/bounds utilities
│   └── navigation/      # Routing algorithms
│       ├── buildGraph.ts
│       ├── dijkstra.ts
│       ├── findNearestNode.ts
│       ├── snapToPath.ts
│       └── routeToGeoJson.ts
└── src/                   # Data and domain
    ├── data/             # Campus data (paths, buildings, places)
    └── domain/           # Type definitions
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Nav
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Mapbox Token (Optional but Recommended)**

   The app includes a fallback token, but for production use, create a `.env` file:

   ```bash
   cp .env.example .env
   ```

   Add your Mapbox access token:

   ```
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

   You can get a free token from [Mapbox](https://account.mapbox.com/access-tokens/)

   **Note**: If you skip this step, the app will use the fallback token, but it's better to use your own token for security and quota management.

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on device/emulator**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

## Usage

### Basic Navigation

1. **Search for a location**: Tap the search bar and type a place name
2. **Select destination**: Tap on a search result or map marker
3. **Start navigation**: Tap "Start Navigation" or use quick navigation button
4. **View route**: The route will be displayed on the map with distance and time
5. **Stop navigation**: Swipe down on the navigation panel or tap the close button

### Advanced Features

- **Zoom controls**: Use floating buttons to zoom in/out
- **Map styles**: Toggle between different map styles
- **Current location**: Tap the location button to center on your position
- **Place details**: Tap any place marker to see details and start navigation
- **Settings**: Access menu to configure app preferences

## Architecture

### Graph-Based Routing

The app uses a graph-based routing system:

1. Campus paths are converted into a graph structure
2. User location is snapped to the nearest path segment
3. A temporary start node is added to the graph
4. Dijkstra's algorithm finds the shortest path
5. Route is converted to GeoJSON for display

### State Management

- **Custom Hooks**: Encapsulate location, search, and navigation logic
- **React State**: Component-level state for UI interactions
- **Memoization**: Optimized route calculations with `useMemo`

## Configuration

### Campus Data

Edit campus data in `src/data/`:

- `campusPlaces.ts`: Campus locations and places
- `geo/paths.ts`: Walkable paths (LineString features)
- `geo/buildings.ts`: Building polygons
- `geo/campusBoundary.ts`: Campus boundary polygon

### Map Settings

Default camera settings can be adjusted in `app/(tabs)/map.tsx`:

```typescript
const DEFAULT_CAMERA_SETTINGS = {
  zoomLevel: 16,
  centerCoordinate: [longitude, latitude],
  navigationZoomLevel: 17,
};
```

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configuration with Expo preset
- Path aliases configured (`@/*`)

### Adding New Features

1. **New Places**: Add to `src/data/campusPlaces.ts`
2. **New Paths**: Add LineString features to `src/data/geo/paths.ts`
3. **New Components**: Create in `components/` directory
4. **New Hooks**: Create in `hooks/` directory

## Troubleshooting

### Map not loading

- Check Mapbox token is set correctly in `.env`
- Verify internet connection
- Check Mapbox account quota

### Location not updating

- Ensure location permissions are granted
- Check device GPS is enabled
- Verify `expo-location` is properly configured

### Route calculation fails

- Ensure user is within campus boundary
- Check paths data is valid GeoJSON
- Verify graph building completes successfully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Maps powered by [Mapbox](https://www.mapbox.com)
- Geospatial calculations with [Turf.js](https://turfjs.org)
