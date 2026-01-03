import { useState } from 'react';
import { CampusPlace } from '@/src/domain/campus';

export const useSearch = (places: CampusPlace[] = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CampusPlace[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Show all places when search is focused
  const showAllLocations = () => {
    console.log('Showing all locations:', places.length);
    setSearchResults(places);
    setShowResults(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length > 0) {
      // Filter places by name and type
      const filtered = places.filter(place =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.type.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      // Show all places when search is empty
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setIsSearchFocused(false);
  };

  const handleSelectResult = (result: CampusPlace) => {
    setSearchQuery(result.name);
    setShowResults(false);
    setIsSearchFocused(false);
  };

  return {
    searchQuery,
    searchResults,
    showResults,
    isSearchFocused,
    handleSearch,
    clearSearch,
    handleSelectResult,
    setIsSearchFocused,
    showAllLocations
  };
};


