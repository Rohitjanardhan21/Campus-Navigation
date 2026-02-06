import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface SmartFloatingButtonsProps {
  onCurrentLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapStyle?: () => void;
  on3DView?: () => void;
  isNavigating?: boolean;
}

const SmartFloatingButtons: React.FC<SmartFloatingButtonsProps> = ({
  onCurrentLocation,
  onZoomIn,
  onZoomOut,
  onToggleMapStyle,
  on3DView,
  isNavigating = false,
}) => {
  // const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  interface FloatingButtonProps {
    icon: string;
    onPress: () => void;
    color?: string;
    iconColor?: string;
    delay?: number;
    size?: "small" | "medium" | "large";
  }

  const FloatingButton: React.FC<FloatingButtonProps> = ({
    icon,
    onPress,
    color = "#FFFFFF",
    iconColor = "#1A73E8",
    delay = 0,
    size = "medium",
  }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    }, []);

    const buttonSize = size === "large" ? 64 : size === "medium" ? 56 : 48;
    const iconSize = size === "large" ? 32 : size === "medium" ? 28 : 24;

    return (
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          accessible={true}
          accessibilityRole="button"
          activeOpacity={0.8}
          style={[
            styles.floatingButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: color,
            },
          ]}
        >
          <Ionicons name={icon as any} size={iconSize} color={iconColor} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main action button - Current Location */}
      <FloatingButton
        icon="locate"
        onPress={onCurrentLocation}
        color="#1A73E8"
        iconColor="#FFFFFF"
        size="large"
        delay={0}
      />

      {/* Secondary buttons */}
      <View style={styles.secondaryButtons}>
        <FloatingButton icon="add" onPress={onZoomIn} delay={100} />
        <FloatingButton icon="remove" onPress={onZoomOut} delay={150} />
      </View>

      {/* Utility buttons */}
      {(onToggleMapStyle || on3DView) && (
        <View style={styles.utilityButtons}>
          {onToggleMapStyle && (
            <FloatingButton
              icon="layers"
              onPress={onToggleMapStyle}
              delay={200}
              size="small"
            />
          )}
          {on3DView && (
            <FloatingButton
              icon="cube"
              onPress={on3DView}
              delay={250}
              size="small"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 120,
    alignItems: "flex-end",
    gap: 12,
    zIndex: 999,
  },
  floatingButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButtons: {
    gap: 8,
  },
  utilityButtons: {
    gap: 8,
  },
});

export default SmartFloatingButtons;
