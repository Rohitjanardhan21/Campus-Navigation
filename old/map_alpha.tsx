import {
  CUSTOM_MAPBOX_CONFIG,
  CUSTOM_STYLE_CONFIG,
  styleManager,
} from "@/services/customMapboxStyle";
import { CAMPUS_PLACES } from "@/src/data/campusPlaces";
import { BUILDINGS } from "@/src/data/geo/buildings";
import { CAMPUS_BOUNDARY } from "@/src/data/geo/campusBoundary";
import { CAMPUS_PATHS } from "@/src/data/geo/paths";
import Mapbox from "@rnmapbox/maps";
import { useEffect, useRef, useState } from "react";
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
// import { useTheme } from "@/hooks/useTheme";

// Components
import SmartFloatingButtons from "@/components/FloatingButtons";
import InstructionsPanel from "@/components/InstructionsPanel";
import MenuModal from "@/components/MenuModal";
import EnhancedNavigationPanel from "@/components/NavigationPanel";
import PlaceDetailsModal from "@/components/PlaceDetailsModal";
import RouteProgressBar from "@/components/RouteProgressBar";
import FuturisticSearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SettingsModal from "@/components/SettingsModal";

// Import Mapbox access token - using your custom token
import { MAPBOX_TOKEN } from "@/services/config";

// Initialize Mapbox safely
try {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
} catch (error) {
  console.error("Failed to set Mapbox token:", error);
}

const DEFAULT_CAMERA_SETTINGS = {
  zoomLevel: 16,
  centerCoordinate: [77.48, 12.94] as [number, number], // Your specified location
  navigationZoomLevel: 17,
};

const MapScreen = () => {
  // const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mapStyle, setMapStyle] = useState(CUSTOM_MAPBOX_CONFIG.styleUrl);
  const [currentZoom, setCurrentZoom] = useState(
    DEFAULT_CAMERA_SETTINGS.zoomLevel,
  );
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(true);
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
    categories,
    selectedCategory,
    handleSearch,
    handleCategoryChange,
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
    navigationSteps,
    currentStepIndex,
    routeProgress,
    updateNavigationProgress,
    startNavigation,
    stopNavigation,
    handleImmediateMapNavigation,
  } = useNavigation();

  useEffect(() => {
    const initMap = async () => {
      try {
        // Request location permissions first
        await Mapbox.requestAndroidLocationPermissions();
        setReady(true);
      } catch (error) {
        console.error("Map initialization error:", error);
        // Continue anyway to prevent black screen
        setReady(true);
      }
    };

    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Update navigation progress when user location changes
  useEffect(() => {
    if (userLocation && isNavigating) {
      updateNavigationProgress(userLocation);
    }
  }, [userLocation, isNavigating, updateNavigationProgress]);

  // Update camera when user location is first detected
  useEffect(() => {
    if (userLocation && cameraRef.current && ready && !hasCenteredOnUser) {
      // Only update camera on first location detection
      const timer = setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: userLocation,
          zoomLevel: DEFAULT_CAMERA_SETTINGS.zoomLevel,
          animationDuration: 1500,
        });
        setHasCenteredOnUser(true);
        setIsWaitingForLocation(false);
      }, 500); // Small delay to ensure map is fully loaded

      return () => clearTimeout(timer);
    }
  }, [userLocation, ready, hasCenteredOnUser]);

  // Set timeout for location detection
  useEffect(() => {
    if (ready && isWaitingForLocation) {
      const locationTimeout = setTimeout(() => {
        if (!userLocation) {
          setIsWaitingForLocation(false);
          console.log("Location timeout - using default location");
        }
      }, 8000); // 8 second timeout

      return () => clearTimeout(locationTimeout);
    }
  }, [ready, isWaitingForLocation, userLocation]);

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
        "Please wait for your location to be detected",
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
    place: (typeof CAMPUS_PLACES)[0],
  ) => {
    setShowPlaceDetails(false);
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please wait for your location to be detected",
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
    const availableStyles = styleManager.getAvailableStyles();
    const currentIndex = availableStyles.findIndex(
      (style) => style.url === mapStyle,
    );
    const nextIndex = (currentIndex + 1) % availableStyles.length;
    const nextStyle = availableStyles[nextIndex];

    setMapStyle(nextStyle.url);
    console.log(`Switched to ${nextStyle.name} style`);
  };

  if (!ready) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10, color: "#5F6368" }}>Loading map...</Text>
        <Text style={{ marginTop: 5, fontSize: 12, color: "#9AA0A6" }}>
          Getting your location
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {ready ? (
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={mapStyle}
          onPress={handleMapPressAndRoute}
          onDidFinishLoadingMap={() => console.log("Map loaded successfully")}
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
              style={{
                fillColor: CUSTOM_STYLE_CONFIG.campusLayers.boundary.fillColor,
                fillOpacity: 0.1,
              }}
            />
            <Mapbox.LineLayer
              id="campus-line"
              style={{
                lineColor:
                  CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeColor,
                lineWidth:
                  CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeWidth,
                lineDasharray:
                  CUSTOM_STYLE_CONFIG.campusLayers.boundary.strokeDasharray,
              }}
            />
          </Mapbox.ShapeSource>

          {/* Campus Buildings */}
          <Mapbox.ShapeSource
            id="campus-buildings"
            shape={BUILDINGS}
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
                    Math.pow(place.coordinate[1] - coord[1], 2),
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
              style={{
                fillColor: CUSTOM_STYLE_CONFIG.campusLayers.buildings.fillColor,
                fillOpacity:
                  CUSTOM_STYLE_CONFIG.campusLayers.buildings.fillOpacity,
              }}
            />
            <Mapbox.LineLayer
              id="campus-building-outline"
              style={{
                lineColor:
                  CUSTOM_STYLE_CONFIG.campusLayers.buildings.strokeColor,
                lineWidth:
                  CUSTOM_STYLE_CONFIG.campusLayers.buildings.strokeWidth,
              }}
            />
          </Mapbox.ShapeSource>

          {/* Campus Paths */}
          <Mapbox.ShapeSource id="campus-paths" shape={CAMPUS_PATHS}>
            <Mapbox.LineLayer
              id="path-line"
              style={{
                lineColor: CUSTOM_STYLE_CONFIG.campusLayers.paths.strokeColor,
                lineWidth: CUSTOM_STYLE_CONFIG.campusLayers.paths.strokeWidth,
                lineOpacity:
                  CUSTOM_STYLE_CONFIG.campusLayers.paths.strokeOpacity,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>

          {/* Route Display */}
          {isNavigating && routeInfo?.feature && (
            <Mapbox.ShapeSource id="route-source" shape={routeInfo.feature}>
              <Mapbox.LineLayer
                id="route-line-background"
                style={{
                  lineColor:
                    CUSTOM_STYLE_CONFIG.campusLayers.route
                      .backgroundStrokeColor,
                  lineWidth:
                    CUSTOM_STYLE_CONFIG.campusLayers.route
                      .backgroundStrokeWidth,
                  lineOpacity:
                    CUSTOM_STYLE_CONFIG.campusLayers.route
                      .backgroundStrokeOpacity,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              <Mapbox.LineLayer
                id="route-line"
                style={{
                  lineColor: CUSTOM_STYLE_CONFIG.campusLayers.route.strokeColor,
                  lineWidth: CUSTOM_STYLE_CONFIG.campusLayers.route.strokeWidth,
                  lineOpacity:
                    CUSTOM_STYLE_CONFIG.campusLayers.route.strokeOpacity,
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
      ) : (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={{ marginTop: 10, color: "#5F6368" }}>
            Loading map...
          </Text>
          <Text style={{ marginTop: 5, fontSize: 12, color: "#9AA0A6" }}>
            Getting your location
          </Text>
        </View>
      )}

      {/* Location Loading Indicator */}
      {isWaitingForLocation && !userLocation && (
        <View style={styles.locationLoadingContainer}>
          <View style={styles.locationLoadingCard}>
            <ActivityIndicator size="small" color="#1A73E8" />
            <Text style={styles.locationLoadingText}>
              Getting your location...
            </Text>
          </View>
        </View>
      )}

      {/* Route Progress Bar */}
      {isNavigating && navigationSteps.length > 0 && (
        <RouteProgressBar
          currentInstruction={navigationSteps[currentStepIndex]}
          progress={routeProgress}
          isNavigating={isNavigating}
        />
      )}

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
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
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
          onShowInstructions={() => setShowInstructionsPanel(true)}
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
            "Campus Navigation App v1.0\n\nA modern navigation app with real-time directions and advanced features.",
          );
        }}
        onHelp={() => {
          setShowMenuModal(false);
          Alert.alert(
            "Help & Support",
            "For help:\n• Tap search to find locations\n• Tap a location to navigate\n• Use voice guidance for directions",
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

      {/* Turn-by-Turn Instructions Panel */}
      <InstructionsPanel
        instructions={navigationSteps}
        currentInstructionIndex={currentStepIndex}
        visible={showInstructionsPanel}
        onClose={() => setShowInstructionsPanel(false)}
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
  locationLoadingContainer: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    zIndex: 998,
    alignItems: "center",
  },
  locationLoadingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  locationLoadingText: {
    fontSize: 14,
    color: "#5F6368",
    fontWeight: "500",
  },
});
