const FacilityRepository = require("../repositories/facilityRepository");

/**
 * Service layer for healthcare facilities business logic
 */
class FacilityService {
  
  /**
   * Get all facilities with pagination
   */
  static async getAllFacilities(page = 1, limit = 100) {
    return await FacilityRepository.getAll(page, limit);
  }

  /**
   * Get facility by ID
   */
  static async getFacilityById(id) {
    const facility = await FacilityRepository.getById(id);
    if (!facility) {
      throw new Error(`No facility found with ID: ${id}`);
    }
    return facility;
  }

  /**
   * Create new facility with validation
   */
  static async createFacility(facilityData) {
    // Basic validation
    if (!facilityData.name) {
      throw new Error('Facility name is required');
    }
    
    return await FacilityRepository.create(facilityData);
  }

  /**
   * Update facility with validation
   */
  static async updateFacility(id, updates) {
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const facility = await FacilityRepository.update(id, updates);
    if (!facility) {
      throw new Error(`Facility not found with ID: ${id}`);
    }
    return facility;
  }

  /**
   * Delete facility
   */
  static async deleteFacility(id) {
    const deleted = await FacilityRepository.delete(id);
    if (!deleted) {
      throw new Error(`Facility not found with ID: ${id}`);
    }
    return deleted;
  }

  /**
   * Search facilities with filters
   */
  static async searchFacilities(filters, page = 1, limit = 100) {
    return await FacilityRepository.search(filters, page, limit);
  }

  /**
   * Find nearest facilities with validation
   */
  static async findNearestFacilities(lat, lng, radius = 5000, limit = 10, type = null) {
    // Validate coordinates
    if (!this.isValidCoordinate(lat, lng)) {
      throw new Error('Invalid coordinates provided');
    }

    // Validate radius
    if (radius < 100 || radius > 50000) {
      throw new Error('Radius must be between 100m and 50km');
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await FacilityRepository.findNearest(lat, lng, radius, limit, type);
  }

  /**
   * Get facilities by type with validation
   */
  static async getFacilitiesByType(type, page = 1, limit = 100, filters = {}) {
    const supportedTypes = ['pharmacy', 'hospital', 'clinic', 'dentist', 'doctor'];
    
    if (!supportedTypes.includes(type.toLowerCase())) {
      throw new Error(`Unsupported facility type: ${type}. Supported types: ${supportedTypes.join(', ')}`);
    }

    return await FacilityRepository.findByType(type, page, limit, filters);
  }

  /**
   * Find facilities in area with validation
   */
  static async findFacilitiesInArea(polygon, type = null, limit = 100) {
    // Validate polygon
    if (!Array.isArray(polygon) || polygon.length < 3) {
      throw new Error('Polygon must be an array of at least 3 coordinate pairs');
    }

    // Validate each coordinate in polygon
    for (const coord of polygon) {
      if (!Array.isArray(coord) || coord.length !== 2) {
        throw new Error('Each polygon coordinate must be [longitude, latitude]');
      }
      if (!this.isValidCoordinate(coord[1], coord[0])) {
        throw new Error(`Invalid coordinate in polygon: [${coord[0]}, ${coord[1]}]`);
      }
    }

    // Validate limit
    if (limit < 1 || limit > 500) {
      throw new Error('Limit must be between 1 and 500');
    }

    return await FacilityRepository.findInArea(polygon, type, limit);
  }

  /**
   * Get facility statistics
   */
  static async getFacilityStats(city = null) {
    return await FacilityRepository.getStats(city);
  }

  /**
   * Get facilities summary by city
   */
  static async getFacilitiesSummaryByCity() {
    const stats = await FacilityRepository.getStats();
    
    return {
      total_facilities: stats.total,
      cities_count: stats.cities.length,
      cities: stats.cities,
      types_breakdown: stats.by_type
    };
  }

  /**
   * Find emergency facilities (hospitals) near location
   */
  static async findEmergencyFacilities(lat, lng, radius = 10000) {
    return await this.findNearestFacilities(lat, lng, radius, 10, 'hospital');
  }

  /**
   * Find pharmacies near location (convenience method)
   */
  static async findNearbyPharmacies(lat, lng, radius = 2000) {
    return await this.findNearestFacilities(lat, lng, radius, 20, 'pharmacy');
  }

  /**
   * Get facility recommendations based on type and location
   */
  static async getFacilityRecommendations(lat, lng, type, maxDistance = 5000) {
    const facilities = await this.findNearestFacilities(lat, lng, maxDistance, 5, type);
    
    // Add recommendation score based on distance
    return facilities.map(facility => ({
      ...facility,
      recommendation_score: this.calculateRecommendationScore(facility.distance_meters),
      distance_category: this.getDistanceCategory(facility.distance_meters)
    }));
  }

  // Helper methods
  static isValidCoordinate(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && !isNaN(longitude) &&
           latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
  }

  static calculateRecommendationScore(distanceMeters) {
    // Score from 0-100 based on proximity (closer = higher score)
    if (distanceMeters <= 500) return 100;
    if (distanceMeters <= 1000) return 90;
    if (distanceMeters <= 2000) return 80;
    if (distanceMeters <= 5000) return 70;
    if (distanceMeters <= 10000) return 60;
    return 50;
  }

  static getDistanceCategory(distanceMeters) {
    if (distanceMeters <= 500) return 'Very Close';
    if (distanceMeters <= 1000) return 'Close';
    if (distanceMeters <= 2000) return 'Nearby';
    if (distanceMeters <= 5000) return 'Moderate';
    if (distanceMeters <= 10000) return 'Far';
    return 'Very Far';
  }

  /**
   * Validate and sanitize search filters
   */
  static sanitizeSearchFilters(filters) {
    const sanitized = {};
    
    // Text fields - trim and limit length
    const textFields = ['name', 'healthcare', 'city', 'amenity', 'building', 'operator', 'source'];
    textFields.forEach(field => {
      if (filters[field] && typeof filters[field] === 'string') {
        const trimmed = filters[field].trim();
        if (trimmed.length > 0 && trimmed.length <= 100) {
          sanitized[field] = trimmed;
        }
      }
    });

    // Numeric fields
    if (filters.page) {
      const page = parseInt(filters.page);
      if (!isNaN(page) && page > 0) {
        sanitized.page = page;
      }
    }

    if (filters.limit) {
      const limit = parseInt(filters.limit);
      if (!isNaN(limit) && limit > 0 && limit <= 1000) {
        sanitized.limit = limit;
      }
    }

    return sanitized;
  }
}

module.exports = FacilityService;