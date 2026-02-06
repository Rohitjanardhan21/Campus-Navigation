// Enhanced Search Service - Semantic & Location-Based Search
import { CampusPlace } from '@/src/domain/campus';
import { SearchFilters } from '@/src/types/enhanced-navigation';

export class EnhancedSearchService {
  private places: CampusPlace[];

  constructor(places: CampusPlace[]) {
    this.places = places;
  }

  // Semantic search with natural language processing
  semanticSearch(query: string, filters?: SearchFilters): CampusPlace[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Handle common semantic queries
    const semanticMappings = {
      'coffee': ['canteen', 'cafeteria', 'cafe'],
      'food': ['canteen', 'cafeteria', 'restaurant', 'dining'],
      'eat': ['canteen', 'cafeteria', 'restaurant', 'dining'],
      'study': ['library', 'study hall', 'reading room'],
      'quiet': ['library', 'study room'],
      'restroom': ['toilet', 'bathroom', 'washroom'],
      'toilet': ['restroom', 'bathroom', 'washroom'],
      'bathroom': ['restroom', 'toilet', 'washroom'],
      'parking': ['parking lot', 'garage'],
      'gym': ['sports', 'fitness', 'gymnasium'],
      'lab': ['laboratory', 'computer lab', 'science lab'],
      'office': ['faculty office', 'admin office', 'administration'],
      'class': ['classroom', 'lecture hall'],
      'lecture': ['classroom', 'lecture hall'],
      'admin': ['administration', 'office'],
      'book': ['library'],
      'read': ['library'],
    };

    let searchTerms = [normalizedQuery];
    
    // Expand search terms based on semantic mappings
    for (const [key, synonyms] of Object.entries(semanticMappings)) {
      if (normalizedQuery.includes(key)) {
        searchTerms.push(...synonyms);
      }
    }

    // Search in places
    const results: (CampusPlace & { relevanceScore: number })[] = [];
    
    this.places.forEach(place => {
      const score = this.calculateRelevanceScore(place, searchTerms, filters);
      if (score > 0) {
        results.push({ ...place, relevanceScore: score });
      }
    });

    // Sort by relevance score and return without score
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ relevanceScore, ...place }) => place);
  }

  // Find nearby locations based on user's current position
  findNearbyPlaces(
    userCoordinate: [number, number], 
    searchQuery?: string,
    radius: number = 0.002 // ~200 meters
  ): CampusPlace[] {
    let results = this.places.filter(place => 
      this.isWithinRadius(userCoordinate, place.coordinate, radius)
    );

    // If search query provided, filter by semantic search
    if (searchQuery && searchQuery.trim()) {
      const semanticResults = this.semanticSearch(searchQuery);
      const semanticIds = new Set(semanticResults.map(p => p.id));
      results = results.filter(place => semanticIds.has(place.id));
    }

    // Sort by distance
    return results.sort((a, b) => 
      this.calculateDistance(userCoordinate, a.coordinate) - 
      this.calculateDistance(userCoordinate, b.coordinate)
    );
  }

  // Find places by category with location priority
  findByCategory(
    category: string, 
    userCoordinate?: [number, number]
  ): CampusPlace[] {
    const results = this.places.filter(place => 
      place.type.toLowerCase() === category.toLowerCase()
    );

    // Sort by distance if user location provided
    if (userCoordinate) {
      return results.sort((a, b) => 
        this.calculateDistance(userCoordinate, a.coordinate) - 
        this.calculateDistance(userCoordinate, b.coordinate)
      );
    }

    return results;
  }

  // Get suggestions based on partial input
  getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (!partialQuery || partialQuery.length < 2) return [];

    const query = partialQuery.toLowerCase();
    const suggestions = new Set<string>();

    // Add place names that match
    this.places.forEach(place => {
      if (place.name.toLowerCase().includes(query)) {
        suggestions.add(place.name);
      }
    });

    // Add semantic suggestions
    const semanticKeywords = [
      'coffee', 'food', 'study', 'quiet', 'restroom', 'parking', 
      'gym', 'lab', 'office', 'class', 'library', 'canteen'
    ];

    semanticKeywords.forEach(keyword => {
      if (keyword.includes(query)) {
        suggestions.add(keyword);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  private calculateRelevanceScore(
    place: CampusPlace, 
    searchTerms: string[], 
    filters?: SearchFilters
  ): number {
    let score = 0;
    
    // Name matching (highest priority)
    searchTerms.forEach(term => {
      if (place.name.toLowerCase().includes(term)) {
        score += 10;
      }
      if (place.description?.toLowerCase().includes(term)) {
        score += 5;
      }
      if (place.type.toLowerCase().includes(term)) {
        score += 8;
      }
    });
    
    // Apply filters
    if (filters) {
      if (filters.category && !filters.category.includes(place.type)) {
        return 0;
      }
      if (filters.openNow && !this.isOpenNow(place)) {
        return 0;
      }
    }
    
    return score;
  }

  private isWithinRadius(
    center: [number, number], 
    point: [number, number], 
    radius: number
  ): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radius;
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    // Haversine formula for more accurate distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private isOpenNow(place: CampusPlace): boolean {
    if (!place.hours) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Simple hour parsing (extend for complex schedules)
    const hours = place.hours.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s*-\s*(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!hours) return true;
    
    const startHour = parseInt(hours[1]) + (hours[3].toUpperCase() === 'PM' && parseInt(hours[1]) !== 12 ? 12 : 0);
    const startMin = parseInt(hours[2]);
    const endHour = parseInt(hours[4]) + (hours[6].toUpperCase() === 'PM' && parseInt(hours[4]) !== 12 ? 12 : 0);
    const endMin = parseInt(hours[5]);
    
    const startTime = startHour * 100 + startMin;
    const endTime = endHour * 100 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  }
}

// Export singleton instance
export const enhancedSearchService = new EnhancedSearchService([]);