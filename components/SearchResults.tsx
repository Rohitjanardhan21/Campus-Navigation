import { CampusPlace } from '@/src/domain/campus';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const iconMap: Record<string, string> = {
  academic: 'school',
  library: 'library',
  food: 'restaurant',
  sports: 'basketball',
  admin: 'business',
  shopping: 'cart',
  building: 'business',
  university: 'school',
  garden: 'leaf',
  landmark: 'map',
  entrance: 'enter',
  hostel: 'home',
  services: 'construct',
  parking: 'car',
  default: 'location'
};

interface SearchResultsProps {
  results: CampusPlace[];
  onSelectResult: (result: CampusPlace) => void;
  onQuickNavigation?: (result: CampusPlace) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectResult,
  onQuickNavigation
}) => {
  // const { theme } = useTheme();

  const renderResultItem = ({ item }: { item: CampusPlace }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        console.log('Search result selected:', item);
        onSelectResult(item);
      }}
    >
      <Ionicons
        name={iconMap[item.type] || iconMap.default as any}
        size={20}
        color="#1A73E8"
        style={styles.resultIcon}
      />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>

      {onQuickNavigation && (
        <TouchableOpacity
          onPress={() => {
            console.log('Navigate button pressed:', item);
            onQuickNavigation(item);
          }}
          style={styles.navigateButton}
        >
          <Ionicons name="navigate" size={24} color="#1A73E8" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (!results || results.length === 0) {
    return null;
  }

  console.log('Rendering search results:', results.length);

  // const styles = createStyles(theme);

  return (
    <View style={styles.resultsContainer}>
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={(item, index) => item.id || `search-result-${index}`}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  resultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    left: 16,
    right: 16,
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#5F6368',
  },
  navigateButton: {
    padding: 8,
  },
});

const styles = createStyles(null);

export default SearchResults;

