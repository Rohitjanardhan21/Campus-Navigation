import { CAMPUS_PLACES } from "@/src/data/campusPlaces";
import { CAMPUS_BUILDINGS } from "@/src/data/geo/buildings";
import { CAMPUS_BOUNDARY } from "@/src/data/geo/campusBoundary";
import { CAMPUS_PATHS } from "@/src/data/geo/paths";
import Mapbox from "@rnmapbox/maps";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Hooks
import { useLocation } from "@/hooks/useLocation";
import { useNavigation } from "@/hooks/useNavigation";
import { useSearch } from "@/hooks/useSearch";

// Components
import SmartFloatingButtons from "@/components/FloatingButtons";
import MenuModal from "@/components/MenuModal";
import EnhancedNavigationPanel from "@/components/NavigationPanel";
import PlaceDetailsModal from "@/components/PlaceDetailsModal";
import FuturisticSearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SettingsModal from "@/components/SettingsModal";

// Set Mapbox access token - using environment variable or fallback
const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "pk.eyJ1IjoiYmVyaWNrcyIsImEiOiJjbWVkMmxhdDIwNXdyMmxzNTA3ZnprMHk3In0.hE8cQigI9JFbb9YBHnOsHQ";
Mapbox.setAccessToken(MAPBOX_TOKEN);

const DEFAULT_CAMERA_SETTINGS = {
  zoomLevel: 16,
  centerCoordinate: [77.6033, 12.9343] as [number, number],
  navigationZoomLevel: 17,
};

const MapScreen = () => {
  const [ready, setReady] = useState(false);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v11"
  );
  const [currentZoom, setCurrentZoom] = useState(
    DEFAULT_CAMERA_SETTINGS.zoomLevel
  );
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<
    (typeof CAMPUS_PLACES)[0] | null
  >(null);

  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapRef = useRef<Mapbox.MapView>(null);

  // Use custom hooks
  const { userLocation, goToCurrentLocation } = useLocation();

  const {
    searchQuery,
    searchResults,
    showResults,
    isSearchFocused,
    handleSearch,
    clearSearch,
    handleSelectResult: selectResult,
    setIsSearchFocused,
    showAllLocations,
  } = useSearch(CAMPUS_PLACES);

  const {
    selectedDestination,
    routeInfo,
    isNavigating,
    travelTime,
    distance,
    slideAnim,
    startNavigation,
    stopNavigation,
    handleImmediateMapNavigation,
  } = useNavigation();

  useEffect(() => {
    const initMap = async () => {
      try {
        await Mapbox.requestAndroidLocationPermissions();
        setReady(true);
      } catch (error) {
        console.error("Map initialization error:", error);
        setReady(true); // Continue anyway
      }
    };
    initMap();
  }, []);

  const handleGoToCurrentLocation = async () => {
    try {
      const location = await goToCurrentLocation();
      if (location && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: location,
          zoomLevel: 16,
          animationDuration: 1000,
        });
      }
    } catch (error) {
      console.error("Error going to current location:", error);
      Alert.alert("Error", "Could not get current location");
    }
  };

  const handleMapPressAndRoute = (event: any) => {
    if (isSearchFocused || (searchResults && searchResults.length > 0)) {
      clearSearch();
      Keyboard.dismiss();
    }

    if (handleImmediateMapNavigation) {
      handleImmediateMapNavigation(event, userLocation);
    }
  };

  const handleSelectResult = (result: (typeof CAMPUS_PLACES)[0]) => {
    selectResult(result);
    Keyboard.dismiss();

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: result.coordinate,
        zoomLevel: 17,
        animationDuration: 1000,
      });
    }
  };

  const handleQuickNavigation = async (item: (typeof CAMPUS_PLACES)[0]) => {
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please wait for your location to be detected"
      );
      return;
    }

    try {
      handleSelectResult(item);
      await startNavigation(userLocation, item);
    } catch (error) {
      console.error("Error in quick navigation:", error);
      Alert.alert("Error", "Failed to start navigation");
    }
  };

  const handlePlacePress = (place: (typeof CAMPUS_PLACES)[0]) => {
    setSelectedPlace(place);
    setShowPlaceDetails(true);
  };

  const handleStartNavigationFromPlace = async (
    place: (typeof CAMPUS_PLACES)[0]
  ) => {
    setShowPlaceDetails(false);
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please wait for your location to be detected"
      );
      return;
    }
    await startNavigation(userLocation, place);
  };

  const zoomIn = () => {
    const newZoom = Math.min(currentZoom + 1, 20);
    setCurrentZoom(newZoom);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  };

  const zoomOut = () => {
    const newZoom = Math.max(currentZoom - 1, 0);
    setCurrentZoom(newZoom);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  };

  const toggleMapStyle = () => {
    const styles = [
      "mapbox://styles/mapbox/streets-v11",
      "mapbox://styles/mapbox/satellite-v9",
      "mapbox://styles/mapbox/outdoors-v11",
    ];

    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };

  if (!ready) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyle}
        onPress={handleMapPressAndRoute}
        onDidFinishLoadingMap={() => console.log("Map loaded successfully")}
        onDidFailLoadingMap={() => console.warn("Map loading failed")}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            zoomLevel: DEFAULT_CAMERA_SETTINGS.zoomLevel,
            centerCoordinate: DEFAULT_CAMERA_SETTINGS.centerCoordinate,
          }}
        />

        {/* Campus Boundary */}
        <Mapbox.ShapeSource id="campus-boundary" shape={CAMPUS_BOUNDARY}>
          <Mapbox.FillLayer
            id="campus-fill"
            style={{ fillColor: "rgba(0, 122, 255, 0.1)" }}
          />
          <Mapbox.LineLayer
            id="campus-line"
            style={{ lineColor: "#007AFF", lineWidth: 2 }}
          />
        </Mapbox.ShapeSource>

        {/* Campus Buildings */}
        <Mapbox.ShapeSource
          id="campus-buildings"
          shape={CAMPUS_BUILDINGS}
          onPress={(e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const geometry = feature.geometry;
            if (geometry.type !== "Polygon") return;
            const coord = geometry.coordinates[0][0] as [number, number];

            // Find nearest place to this building
            const nearestPlace = CAMPUS_PLACES.find((place) => {
              const dist = Math.sqrt(
                Math.pow(place.coordinate[0] - coord[0], 2) +
                  Math.pow(place.coordinate[1] - coord[1], 2)
              );
              return dist < 0.001; // Very close
            });

            if (nearestPlace) {
              handlePlacePress(nearestPlace);
            }
          }}
        >
          <Mapbox.FillLayer
            id="campus-building-fill"
            style={{ fillColor: "#E0E0E0" }}
          />
          <Mapbox.LineLayer
            id="campus-building-outline"
            style={{ lineColor: "#999", lineWidth: 1 }}
          />
        </Mapbox.ShapeSource>

        {/* Campus Paths */}
        <Mapbox.ShapeSource id="campus-paths" shape={CAMPUS_PATHS}>
          <Mapbox.LineLayer
            id="path-line"
            style={{
              lineColor: "#34C759",
              lineWidth: 4,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </Mapbox.ShapeSource>

        {/* Route Display */}
        {isNavigating && routeInfo?.feature && (
          <Mapbox.ShapeSource id="route-source" shape={routeInfo.feature}>
            <Mapbox.LineLayer
              id="route-line"
              style={{
                lineColor: "#007AFF",
                lineWidth: 6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* User Location */}
        {userLocation && <Mapbox.UserLocation visible={true} />}

        {/* Place Markers */}
        {CAMPUS_PLACES.map((place) => (
          <Mapbox.PointAnnotation
            key={place.id}
            id={place.id}
            coordinate={place.coordinate}
            onSelected={() => handlePlacePress(place)}
          >
            <View style={styles.marker} />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Search Bar */}
      <FuturisticSearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onClear={clearSearch}
        onFocus={() => {
          setIsSearchFocused(true);
          showAllLocations();
        }}
        onBlur={() => {
          if (!searchQuery) {
            setIsSearchFocused(false);
          }
        }}
        isSearchFocused={isSearchFocused}
        onVoiceSearch={() => {
          Alert.alert("Voice Search", "Voice search feature coming soon!", [
            { text: "OK" },
          ]);
        }}
        onMenu={() => setShowMenuModal(true)}
        onProfile={() => {
          Alert.alert("Profile", "User Profile", [
            {
              text: "View Profile",
              onPress: () => Alert.alert("Profile", "Profile details"),
            },
            {
              text: "Edit Profile",
              onPress: () => Alert.alert("Edit", "Edit your profile"),
            },
            {
              text: "Logout",
              onPress: () => Alert.alert("Logout", "Logged out"),
            },
            { text: "Cancel", style: "cancel" },
          ]);
        }}
      />

      {/* Search Results */}
      {showResults && searchResults && searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onSelectResult={handleSelectResult}
          onQuickNavigation={handleQuickNavigation}
        />
      )}

      {/* Navigation Panel */}
      {isNavigating && (
        <EnhancedNavigationPanel
          slideAnim={slideAnim}
          selectedDestination={selectedDestination}
          travelTime={travelTime}
          distance={distance}
          onStopNavigation={stopNavigation}
          isNavigating={isNavigating}
        />
      )}

      {/* Floating Buttons */}
      <SmartFloatingButtons
        onCurrentLocation={handleGoToCurrentLocation}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleMapStyle={toggleMapStyle}
        on3DView={() => Alert.alert("3D View", "3D view activated")}
        onTraffic={() => Alert.alert("Traffic", "Traffic layer toggled")}
        isNavigating={isNavigating}
      />

      {/* Place Details Modal */}
      <PlaceDetailsModal
        visible={showPlaceDetails}
        place={selectedPlace}
        onClose={() => {
          setShowPlaceDetails(false);
          setSelectedPlace(null);
        }}
        onStartNavigation={handleStartNavigationFromPlace}
      />

      {/* Menu Modal */}
      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onSettings={() => {
          setShowMenuModal(false);
          setShowSettingsModal(true);
        }}
        onAbout={() => {
          setShowMenuModal(false);
          Alert.alert(
            "About",
            "Campus Navigation App v1.0\n\nA modern navigation app with real-time directions and advanced features."
          );
        }}
        onHelp={() => {
          setShowMenuModal(false);
          Alert.alert(
            "Help & Support",
            "For help:\n• Tap search to find locations\n• Tap a location to navigate\n• Use voice guidance for directions"
          );
        }}
        onFeedback={() => {
          setShowMenuModal(false);
          Alert.alert("Send Feedback", "We'd love to hear from you!");
        }}
        onShare={async () => {
          setShowMenuModal(false);
          try {
            await Share.share({
              message: "Check out this amazing Campus Navigation App!",
              title: "Campus Navigation App",
            });
          } catch (error) {
            console.error("Share error:", error);
          }
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
