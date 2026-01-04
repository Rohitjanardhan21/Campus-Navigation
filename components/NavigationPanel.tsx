import { CampusPlace } from "@/src/domain/campus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    PanResponder,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Voice guidance - conditionally import expo-speech
// @ts-ignore - expo-speech may not be installed
let Speech: any = null;
try {
  // @ts-ignore
  Speech = require("expo-speech");
} catch {
  // expo-speech not available
}

const iconMap: Record<string, string> = {
  academic: "school",
  library: "library",
  food: "restaurant",
  sports: "basketball",
  admin: "business",
  shopping: "cart",
  building: "business",
  university: "school",
  garden: "leaf",
  landmark: "map",
  entrance: "enter",
  hostel: "home",
  medical: "medical",
  services: "construct",
  parking: "car",
  default: "location",
};

interface EnhancedNavigationPanelProps {
  slideAnim: Animated.Value;
  selectedDestination: CampusPlace | null;
  travelTime: number | null;
  distance: number | null;
  onStopNavigation: () => void;
  isNavigating: boolean;
  onShowInstructions?: () => void;
}

const EnhancedNavigationPanel: React.FC<EnhancedNavigationPanelProps> = ({
  slideAnim,
  selectedDestination,
  travelTime,
  distance,
  onStopNavigation,
  isNavigating,
  onShowInstructions,
}) => {
  // const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  const styles = createStyles(null);

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onStopNavigation();
        }
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    // Pulse animation for active navigation
    if (isNavigating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: (travelTime || 10) * 60 * 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [isNavigating, travelTime]);

  const getArrivalTime = (minutes: number | null): string => {
    if (!minutes) return "--:--";
    const now = new Date();
    now.setMinutes(now.getMinutes() + parseInt(minutes.toString()));
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Audio toggle handler
  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled);
    const message = audioEnabled
      ? "Voice guidance disabled"
      : "Voice guidance enabled";
    Alert.alert("Audio", message);
    if (!audioEnabled && Speech) {
      Speech.speak(message);
    }
  };

  // Steps handler
  const handleSteps = () => {
    if (onShowInstructions) {
      onShowInstructions();
    } else {
      setShowSteps(!showSteps);
      Alert.alert(
        "Navigation Steps",
        `1. Head ${selectedDestination?.name || "destination"}\n2. Continue for ${
          distance || "0"
        } km\n3. Arrive at destination`,
        [{ text: "OK" }]
      );
    }
  };

  // Share handler
  const handleShare = async () => {
    try {
      const message = `I'm navigating to ${
        selectedDestination?.name || "a location"
      }. It's ${distance || "0"} km away and will take about ${
        travelTime || "0"
      } minutes.`;
      await Share.share({
        message: message,
        title: "Navigation Details",
      });
    } catch {
      Alert.alert("Error", "Could not share navigation details");
    }
  };

  // Options handler
  const handleOptions = () => {
    Alert.alert("Navigation Options", "Choose an option:", [
      {
        text: "Avoid Tolls",
        onPress: () => Alert.alert("Info", "Toll avoidance enabled"),
      },
      {
        text: "Avoid Highways",
        onPress: () => Alert.alert("Info", "Highway avoidance enabled"),
      },
      {
        text: "Fastest Route",
        onPress: () => Alert.alert("Info", "Using fastest route"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: Animated.add(slideAnim, panY) }],
        },
      ]}
    >
      <View style={styles.panel}>
        {/* Handle - Swipeable */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Progress Bar */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onStopNavigation}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Stop navigation"
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={36} color="#EA4335" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name={
                selectedDestination?.type && iconMap[selectedDestination.type]
                  ? (iconMap[selectedDestination.type] as any)
                  : "flag"
              }
              size={28}
              color="#FFFFFF"
            />
          </Animated.View>

          <View style={styles.headerText}>
            <Text style={styles.destinationName} numberOfLines={1}>
              {selectedDestination?.name || "Destination"}
            </Text>
            <Text style={styles.subtitle}>
              {isNavigating ? "Navigating..." : "Ready to start"}
            </Text>
          </View>
        </View>

        {/* Route Info Cards */}
        {travelTime && distance && (
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={24} color="#1A73E8" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoValue}>{travelTime}</Text>
                <Text style={styles.infoLabel}>min</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="navigate-outline" size={24} color="#34A853" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoValue}>{distance.toFixed(1)}</Text>
                <Text style={styles.infoLabel}>km</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="alarm-outline" size={24} color="#FBBC04" />
              <View style={styles.infoCardText}>
                <Text style={styles.infoValue}>
                  {getArrivalTime(travelTime)}
                </Text>
                <Text style={styles.infoLabel}>ETA</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAudioToggle}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={audioEnabled ? "Disable audio" : "Enable audio"}
          >
            <Ionicons
              name={audioEnabled ? "volume-high" : "volume-mute"}
              size={20}
              color={audioEnabled ? "#1A73E8" : "#5F6368"}
            />
            <Text
              style={[
                styles.actionText,
                audioEnabled && styles.actionTextActive,
              ]}
            >
              Audio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSteps}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View navigation steps"
          >
            <Ionicons name="list" size={20} color="#5F6368" />
            <Text style={styles.actionText}>Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share navigation"
          >
            <Ionicons name="share-social" size={20} color="#5F6368" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOptions}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Navigation options"
          >
            <Ionicons name="settings" size={20} color="#5F6368" />
            <Text style={styles.actionText}>Options</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 998,
  },
  panel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#DADCE0",
    borderRadius: 3,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: "#1A73E8",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingRight: 50,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A73E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    flex: 1,
  },
  destinationName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#5F6368",
    fontWeight: "500",
  },
  infoCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  infoCardText: {
    flex: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202124",
  },
  infoLabel: {
    fontSize: 12,
    color: "#5F6368",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#5F6368",
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#1A73E8",
    fontWeight: "600",
  },
});

export default EnhancedNavigationPanel;
