import React, { useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FuturisticSearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  onFocus: () => void;
  onBlur: () => void;
  isSearchFocused: boolean;
  onVoiceSearch?: () => void;
  onMenu?: () => void;
  onProfile?: () => void;
}

const FuturisticSearchBar: React.FC<FuturisticSearchBarProps> = ({
  searchQuery,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  isSearchFocused,
  onVoiceSearch,
  onMenu,
  onProfile
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSearchFocused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [isSearchFocused]);

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <View style={styles.searchBar}>
        {onMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenu}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Ionicons name="menu" size={24} color="#1A73E8" />
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#5F6368" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Where to?"
            placeholderTextColor="#9AA0A6"
            value={searchQuery}
            onChangeText={onSearch}
            onFocus={onFocus}
            onBlur={onBlur}
            accessible={true}
            accessibilityLabel="Search input"
            autoComplete="off"
            autoCorrect={false}
            selectionColor="#1A73E8"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={onClear}
              style={styles.clearButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color="#9AA0A6" />
            </TouchableOpacity>
          )}
        </View>

        {onVoiceSearch && (
          <TouchableOpacity
            onPress={onVoiceSearch}
            style={styles.voiceButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
          >
            <Ionicons name="mic" size={22} color="#1A73E8" />
          </TouchableOpacity>
        )}

        {onProfile && (
          <TouchableOpacity
            onPress={onProfile}
            style={styles.profileButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-circle" size={32} color="#1A73E8" />
          </TouchableOpacity>
        )}
      </View>

      {isSearchFocused && (
        <Animated.View style={[
          styles.glowEffect,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6]
            })
          }
        ]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    backgroundColor: '#1A73E8',
    zIndex: -1,
  },
});

export default FuturisticSearchBar;


