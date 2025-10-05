const pool = require("../db");

/**
 * Database helper for healthcare facilities with geographic queries
 */
class FacilityRepository {
  
  /**
   * Base query for selecting facility fields
   */
  static getBaseSelectFields() {
    return `
      ogc_fid as id, 
      name, 
      name_vi, 
      name_en,
      amenity, 
      healthcare, 
      building, 
      addr_city, 
      addr_full, 
      operator_t as operator,
      capacity_p as capacity,
      source,
      osm_id,
      osm_type,
      ST_AsText(geom) as geom
    `;
  }

  /**
   * Get all facilities with pagination
   */
  static async getAll(page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    const countQuery = "SELECT COUNT(*) FROM health_facilities_points";
    const dataQuery = `
      SELECT ${this.getBaseSelectFields()}
      FROM health_facilities_points 
      ORDER BY ogc_fid 
      LIMIT $1 OFFSET $2
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(dataQuery, [limit, offset])
    ]);

    const total = parseInt(countResult.rows[0].count);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get facility by ID
   */
  static async getById(id) {
    const query = `
      SELECT ${this.getBaseSelectFields()}
      FROM health_facilities_points 
      WHERE ogc_fid = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create new facility
   */
  static async create(facilityData) {
    const fields = Object.keys(facilityData).join(', ');
    const placeholders = Object.keys(facilityData).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(facilityData);

    const query = `
      INSERT INTO health_facilities_points (${fields})
      VALUES (${placeholders})
      RETURNING ${this.getBaseSelectFields()}
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update facility
   */
  static async update(id, updates) {
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        updateFields.push(`${key} = $${valueIndex}`);
        values.push(updates[key]);
        valueIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE health_facilities_points 
      SET ${updateFields.join(', ')} 
      WHERE ogc_fid = $${valueIndex}
      RETURNING ${this.getBaseSelectFields()}
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete facility
   */
  static async delete(id) {
    const query = `
      DELETE FROM health_facilities_points 
      WHERE ogc_fid = $1 
      RETURNING ogc_fid as id, name
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find nearest facilities using PostGIS
   */
  static async findNearest(lat, lng, radius = 5000, limit = 10, type = null) {
    let query = `
      SELECT 
        ${this.getBaseSelectFields()},
        ST_Distance(
          ST_Transform(geom, 3857), 
          ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
        ) as distance_meters
      FROM health_facilities_points 
      WHERE ST_DWithin(
        ST_Transform(geom, 3857), 
        ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857), 
        $3
      )
    `;
    
    const params = [parseFloat(lng), parseFloat(lat), parseFloat(radius)];
    let paramIndex = 4;

    // Add type filter
    if (type) {
      const typeCondition = this.buildTypeCondition(type, paramIndex);
      query += typeCondition.condition;
      if (typeCondition.param) {
        params.push(typeCondition.param);
        paramIndex++;
      }
    }

    query += ` ORDER BY distance_meters ASC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      distance_meters: Math.round(row.distance_meters)
    }));
  }

  /**
   * Find facilities by type with pagination
   */
  static async findByType(type, page = 1, limit = 100, filters = {}) {
    const offset = (page - 1) * limit;
    
    let baseQuery = `
      FROM health_facilities_points 
      WHERE ${this.buildTypeFilter(type)}
    `;
    
    const params = [];
    let paramIndex = 1;

    // Add additional filters
    const additionalConditions = this.buildAdditionalFilters(filters, paramIndex);
    if (additionalConditions.conditions.length > 0) {
      baseQuery += ` AND ${additionalConditions.conditions.join(' AND ')}`;
      params.push(...additionalConditions.params);
      paramIndex += additionalConditions.params.length;
    }

    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const dataQuery = `
      SELECT ${this.getBaseSelectFields()} ${baseQuery}
      ORDER BY name 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)),
      pool.query(dataQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Find facilities within polygon area
   */
  static async findInArea(polygon, type = null, limit = 100) {
    const polygonWKT = `POLYGON((${polygon.map(coord => `${coord[0]} ${coord[1]}`).join(', ')}, ${polygon[0][0]} ${polygon[0][1]}))`;

    let query = `
      SELECT ${this.getBaseSelectFields()}
      FROM health_facilities_points 
      WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText($1), 4326))
    `;
    
    const params = [polygonWKT];
    let paramIndex = 2;

    // Add type filter
    if (type) {
      const typeCondition = this.buildTypeCondition(type, paramIndex);
      query += typeCondition.condition;
      if (typeCondition.param) {
        params.push(typeCondition.param);
        paramIndex++;
      }
    }

    query += ` ORDER BY name LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get facility statistics
   */
  static async getStats(city = null) {
    let query = `
      SELECT 
        amenity,
        healthcare,
        COUNT(*) as count,
        array_agg(DISTINCT addr_city) FILTER (WHERE addr_city IS NOT NULL) as cities
      FROM health_facilities_points
    `;
    
    const params = [];
    
    if (city) {
      query += ` WHERE addr_city ILIKE $1`;
      params.push(`%${city}%`);
    }
    
    query += ` GROUP BY amenity, healthcare ORDER BY count DESC`;

    const result = await pool.query(query, params);
    return this.processStats(result.rows);
  }

  /**
   * Advanced search with multiple filters
   */
  static async search(filters, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    let baseQuery = `FROM health_facilities_points WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    const conditions = this.buildSearchConditions(filters, paramIndex);
    if (conditions.conditions.length > 0) {
      baseQuery += ` AND ${conditions.conditions.join(' AND ')}`;
      params.push(...conditions.params);
      paramIndex += conditions.params.length;
    }

    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const dataQuery = `
      SELECT ${this.getBaseSelectFields()} ${baseQuery}
      ORDER BY ogc_fid 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)),
      pool.query(dataQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Helper methods
  static buildTypeFilter(type) {
    switch (type.toLowerCase()) {
      case 'pharmacy':
        return "(amenity = 'pharmacy' OR healthcare = 'pharmacy')";
      case 'hospital':
        return "(amenity = 'hospital' OR healthcare = 'hospital')";
      case 'clinic':
        return "(amenity = 'clinic' OR healthcare = 'clinic')";
      case 'dentist':
        return "(amenity = 'dentist' OR healthcare = 'dentist')";
      case 'doctor':
        return "(amenity = 'doctors' OR healthcare = 'doctor')";
      default:
        throw new Error(`Unsupported facility type: ${type}`);
    }
  }

  static buildTypeCondition(type, paramIndex) {
    switch (type.toLowerCase()) {
      case 'pharmacy':
        return { condition: " AND (amenity = 'pharmacy' OR healthcare = 'pharmacy')", param: null };
      case 'hospital':
        return { condition: " AND (amenity = 'hospital' OR healthcare = 'hospital')", param: null };
      case 'clinic':
        return { condition: " AND (amenity = 'clinic' OR healthcare = 'clinic')", param: null };
      case 'dentist':
        return { condition: " AND (amenity = 'dentist' OR healthcare = 'dentist')", param: null };
      case 'doctor':
        return { condition: " AND (amenity = 'doctors' OR healthcare = 'doctor')", param: null };
      default:
        return { 
          condition: ` AND (amenity ILIKE $${paramIndex} OR healthcare ILIKE $${paramIndex})`, 
          param: `%${type}%` 
        };
    }
  }

  static buildAdditionalFilters(filters, startIndex) {
    const conditions = [];
    const params = [];
    let paramIndex = startIndex;

    if (filters.city) {
      conditions.push(`addr_city ILIKE $${paramIndex}`);
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    if (filters.operator) {
      conditions.push(`operator_t ILIKE $${paramIndex}`);
      params.push(`%${filters.operator}%`);
      paramIndex++;
    }

    return { conditions, params };
  }

  static buildSearchConditions(filters, startIndex) {
    const conditions = [];
    const params = [];
    let paramIndex = startIndex;

    const searchFields = [
      { field: 'name', filter: filters.name },
      { field: 'healthcare', filter: filters.healthcare },
      { field: 'addr_city', filter: filters.city },
      { field: 'amenity', filter: filters.amenity },
      { field: 'building', filter: filters.building },
      { field: 'operator_t', filter: filters.operator },
      { field: 'source', filter: filters.source }
    ];

    searchFields.forEach(({ field, filter }) => {
      if (filter) {
        if (field === 'name') {
          conditions.push(`(name ILIKE $${paramIndex} OR name_vi ILIKE $${paramIndex})`);
        } else {
          conditions.push(`${field} ILIKE $${paramIndex}`);
        }
        params.push(`%${filter}%`);
        paramIndex++;
      }
    });

    return { conditions, params };
  }

  static processStats(rows) {
    const stats = {
      total: 0,
      by_type: {
        pharmacy: 0,
        hospital: 0,
        clinic: 0,
        dentist: 0,
        doctor: 0,
        other: 0
      },
      detailed: rows,
      cities: []
    };

    const allCities = new Set();

    rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      
      if (row.cities) {
        row.cities.forEach(city => allCities.add(city));
      }
      
      const amenity = row.amenity?.toLowerCase() || '';
      const healthcare = row.healthcare?.toLowerCase() || '';
      
      if (amenity === 'pharmacy' || healthcare === 'pharmacy') {
        stats.by_type.pharmacy += count;
      } else if (amenity === 'hospital' || healthcare === 'hospital') {
        stats.by_type.hospital += count;
      } else if (amenity === 'clinic' || healthcare === 'clinic') {
        stats.by_type.clinic += count;
      } else if (amenity === 'dentist' || healthcare === 'dentist') {
        stats.by_type.dentist += count;
      } else if (amenity === 'doctors' || healthcare === 'doctor') {
        stats.by_type.doctor += count;
      } else {
        stats.by_type.other += count;
      }
    });

    stats.cities = Array.from(allCities).sort();
    return stats;
  }
}

module.exports = FacilityRepository;