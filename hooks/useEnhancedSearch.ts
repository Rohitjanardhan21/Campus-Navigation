// Enhanced Search Hook - Semantic & Location-Based Search Only
import { EnhancedSearchService } from '@/services/enhancedSearch';
import { CampusPlace } from '@/src/domain/campus';
import { SearchFilters } from '@/src/types/enhanced-navigation';
import { useCallback, useEffect, useState } from 'react';

export const useEnhancedSearch = (places: CampusPlace[]) => {
  const [searchService] = useState(() => new EnhancedSearchService(places));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CampusPlace[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});

  // Update search service when places change
  useEffect(() => {
    searchService['places'] = places;
  }, [places, searchService]);

  // Perform semantic search
  const performSemanticSearch = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    try {
      const results = searchService.semanticSearch(query, filters);
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Semantic search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchService]);

  // Find nearby places
  const findNearbyPlaces = useCallback(async (
    userLocation: [number, number],
    query?: string,
    radius?: number
  ) => {
    setIsSearching(true);
    try {
      const results = searchService.findNearbyPlaces(userLocation, query, radius);
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Nearby search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchService]);

  // Find places by category
  const findByCategory = useCallback(async (
    category: string,
    userLocation?: [number, number]
  ) => {
    setIsSearching(true);
    try {
      const results = searchService.findByCategory(category, userLocation);
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Category search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchService]);

  // Get search suggestions
  const getSuggestions = useCallback((partialQuery: string, limit?: number) => {
    const newSuggestions = searchService.getSuggestions(partialQuery, limit);
    setSuggestions(newSuggestions);
    return newSuggestions;
  }, [searchService]);

  // Handle search input change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Get suggestions for partial queries
    if (query.length >= 2) {
      getSuggestions(query);
    } else {
      setSuggestions([]);
    }

    // Perform search if query is complete enough
    if (query.length >= 3) {
      performSemanticSearch(query, selectedFilters);
    } else if (query.length === 0) {
      setSearchResults([]);
    }
  }, [performSemanticSearch, selectedFilters, getSuggestions]);

  // Apply filters
  const applyFilters = useCallback((filters: SearchFilters) => {
    setSelectedFilters(filters);
    if (searchQuery.trim()) {
      performSemanticSearch(searchQuery, filters);
    }
  }, [searchQuery, performSemanticSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
    setSelectedFilters({});
  }, []);

  // Quick search for common queries
  const quickSearch = useCallback(async (type: 'coffee' | 'food' | 'study' | 'restroom' | 'parking') => {
    return performSemanticSearch(type, selectedFilters);
  }, [performSemanticSearch, selectedFilters]);

  return {
    // State
    searchQuery,
    searchResults,
    suggestions,
    isSearching,
    selectedFilters,

    // Search functions
    performSemanticSearch,
    findNearbyPlaces,
    findByCategory,
    getSuggestions,
    quickSearch,

    // UI handlers
    handleSearchChange,
    applyFilters,
    clearSearch,

    // Setters
    setSearchQuery,
    setSearchResults,
  };
};