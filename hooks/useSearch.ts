import { CampusPlace } from '@/src/domain/campus';
import { useState } from 'react';

export const useSearch = (places: CampusPlace[] = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CampusPlace[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Available categories
  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'academic', name: 'Academic', icon: 'school' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'hostel', name: 'Hostels', icon: 'home' },
    { id: 'sports', name: 'Sports', icon: 'basketball' },
    { id: 'services', name: 'Services', icon: 'construct' },
    { id: 'parking', name: 'Parking', icon: 'car' },
  ];

  // Enhanced search with category filtering and better matching
  const performSearch = (query: string, category: string = selectedCategory) => {
    if (query.length === 0) {
      // Show all places in selected category when search is empty
      const filtered = category === 'all' 
        ? places 
        : places.filter(place => place.type === category);
      setSearchResults(filtered);
      return filtered;
    }

    // Filter by category first
    const categoryFiltered = category === 'all' 
      ? places 
      : places.filter(place => place.type === category);

    // Then filter by search query with multiple criteria
    const filtered = categoryFiltered.filter(place => {
      const queryLower = query.toLowerCase();
      
      // Match name (highest priority)
      if (place.name.toLowerCase().includes(queryLower)) return true;
      
      // Match type
      if (place.type.toLowerCase().includes(queryLower)) return true;
      
      // Match description if available
      if (place.description?.toLowerCase().includes(queryLower)) return true;
      
      // Match individual words
      const queryWords = queryLower.split(' ');
      const nameWords = place.name.toLowerCase().split(' ');
      
      return queryWords.some(queryWord => 
        nameWords.some(nameWord => nameWord.startsWith(queryWord))
      );
    });

    // Sort results by relevance
    const sorted = filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact matches first
      if (aName === queryLower) return -1;
      if (bName === queryLower) return 1;
      
      // Starts with query
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
      
      // Alphabetical
      return aName.localeCompare(bName);
    });

    setSearchResults(sorted);
    return sorted;
  };

  // Show all places when search is focused
  const showAllLocations = () => {
    console.log('Showing all locations:', places.length);
    const results = performSearch('', selectedCategory);
    setShowResults(true);
    return results;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
    setShowResults(true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    performSearch(searchQuery, category);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setIsSearchFocused(false);
    setSelectedCategory('all');
  };

  const handleSelectResult = (result: CampusPlace) => {
    setSearchQuery(result.name);
    setShowResults(false);
    setIsSearchFocused(false);
    
    // Add to search history (avoid duplicates)
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== result.name);
      return [result.name, ...filtered].slice(0, 5); // Keep last 5 searches
    });
  };

  // Get popular/suggested places
  const getPopularPlaces = () => {
    return places
      .filter(place => ['library', 'canteen', 'main-gate', 'sports-complex'].includes(place.id))
      .slice(0, 4);
  };

  // Get nearby places (mock implementation - in real app would use user location)
  const getNearbyPlaces = (userLocation?: [number, number]) => {
    // For now, return first 6 places as "nearby"
    return places.slice(0, 6);
  };

  return {
    searchQuery,
    searchResults,
    showResults,
    isSearchFocused,
    searchHistory,
    selectedCategory,
    categories,
    handleSearch,
    handleCategoryChange,
    clearSearch,
    handleSelectResult,
    setIsSearchFocused,
    showAllLocations,
    getPopularPlaces,
    getNearbyPlaces,
    performSearch,
  };
};


