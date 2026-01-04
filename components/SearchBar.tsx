import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  categories?: Array<{ id: string; name: string; icon: string }>;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
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
  onProfile,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange
}) => {
  // const { theme, toggleTheme, isDark } = useTheme();
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

  // const styles = createStyles(theme);
  const styles = createStyles(null);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.searchBarContainer,
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
              placeholderTextColor="#5F6368"
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
                <Ionicons name="close-circle" size={20} color="#5F6368" />
              </TouchableOpacity>
            )}
          </View>

          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={() => {}} // toggleTheme
            style={styles.themeButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <Ionicons 
              name="moon" 
              size={22} 
              color="#1A73E8" 
            />
          </TouchableOpacity>

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

      {/* Category Filter */}
      {isSearchFocused && categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => onCategoryChange?.(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? "#FFFFFF" : "#1A73E8"} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBarContainer: {
    position: 'relative',
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
    backgroundColor: '#F8F9FA',
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
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
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
  categoryContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#1A73E8',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#202124',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
});

export default FuturisticSearchBar;


