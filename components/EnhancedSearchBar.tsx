// Enhanced Search Bar Component - Example Integration
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { CampusPlace } from '@/src/domain/campus';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EnhancedSearchBarProps {
  places: CampusPlace[];
  userLocation?: [number, number];
  onSelectPlace: (place: CampusPlace) => void;
  onNearbySearch?: (places: CampusPlace[]) => void;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  places,
  userLocation,
  onSelectPlace,
  onNearbySearch,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const {
    searchQuery,
    searchResults,
    suggestions,
    isSearching,
    handleSearchChange,
    findNearbyPlaces,
    quickSearch,
    clearSearch,
  } = useEnhancedSearch(places);

  const handleInputChange = (text: string) => {
    handleSearchChange(text);
    setShowSuggestions(text.length >= 2);
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const handleQuickAction = async (type: 'coffee' | 'food' | 'study' | 'restroom' | 'parking') => {
    const results = await quickSearch(type);
    setShowQuickActions(false);
    if (results.length === 0) {
      Alert.alert('No Results', `No ${type} locations found on campus.`);
    }
  };

  const handleNearbySearch = async () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to find nearby places.');
      return;
    }

    const results = await findNearbyPlaces(userLocation);
    if (onNearbySearch) {
      onNearbySearch(results);
    }
    if (results.length === 0) {
      Alert.alert('No Results', 'No places found nearby.');
    }
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: CampusPlace }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelectPlace(item)}
    >
      <View>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
        {item.description && (
          <Text style={styles.resultDescription}>{item.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = (type: string, label: string, icon: string) => (
    <TouchableOpacity
      key={type}
      style={styles.quickActionButton}
      onPress={() => handleQuickAction(type as any)}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search campus locations..."
          value={searchQuery}
          onChangeText={handleInputChange}
          onFocus={() => setShowQuickActions(true)}
        />
        
        {/* Clear Button */}
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Nearby Button */}
        {userLocation && (
          <TouchableOpacity style={styles.nearbyButton} onPress={handleNearbySearch}>
            <Text style={styles.nearbyButtonText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      {showQuickActions && searchQuery.length === 0 && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Search</Text>
          <View style={styles.quickActionsRow}>
            {renderQuickAction('coffee', 'Coffee', '☕')}
            {renderQuickAction('food', 'Food', '🍽️')}
            {renderQuickAction('study', 'Study', '📚')}
            {renderQuickAction('restroom', 'Restroom', '🚻')}
            {renderQuickAction('parking', 'Parking', '🅿️')}
          </View>
        </View>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `suggestion-${index}`}
            style={styles.suggestionsList}
          />
        </View>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {isSearching ? 'Searching...' : `${searchResults.length} results found`}
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nearbyButton: {
    padding: 8,
    marginLeft: 4,
  },
  nearbyButtonText: {
    fontSize: 18,
  },
  quickActionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#666',
  },
  suggestionsContainer: {
    maxHeight: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  resultsList: {
    maxHeight: 250,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resultType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    color: '#888',
  },
});