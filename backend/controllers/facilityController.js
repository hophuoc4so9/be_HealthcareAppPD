const FacilityService = require("../services/facilityService");

// Import types (for JSDoc comments)
/**
 * @typedef {import('../types').HealthFacilityDB} HealthFacilityDB
 * @typedef {import('../types').HealthFacilityResponse} HealthFacilityResponse
 * @typedef {import('../types').CreateHealthFacilityInput} CreateHealthFacilityInput
 * @typedef {import('../types').UpdateHealthFacilityInput} UpdateHealthFacilityInput
 * @typedef {import('../types').SearchFacilityParams} SearchFacilityParams
 * @typedef {import('../types').ApiResponseType} ApiResponseType
 */

/**
 * Error handler wrapper for controllers
 */
const handleControllerError = (res, error, defaultMessage = "Server Error") => {
  console.error(error.message);
  const statusCode = error.message.includes('not found') ? 404 : 
                    error.message.includes('required') || error.message.includes('Invalid') ? 400 : 500;
  
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? defaultMessage : error.message,
    message: error.message
  });
};

/**
 * Get all healthcare facilities with pagination
 */
const getAllFacilities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const result = await FacilityService.getAllFacilities(page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Get facility by ID
 */
const getFacilityById = async (req, res) => {
  try {
    const facility = await FacilityService.getFacilityById(req.params.id);
    
    res.json({
      success: true,
      data: facility
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Create new healthcare facility
 */
const createFacility = async (req, res) => {
  try {
    const facility = await FacilityService.createFacility(req.body);

    res.status(201).json({
      success: true,
      data: facility,
      message: "Facility created successfully"
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Update healthcare facility
 */
const updateFacility = async (req, res) => {
  try {
    const facility = await FacilityService.updateFacility(req.params.id, req.body);

    res.json({
      success: true,
      data: facility,
      message: "Facility updated successfully"
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Delete healthcare facility
 */
const deleteFacility = async (req, res) => {
  try {
    const deleted = await FacilityService.deleteFacility(req.params.id);

    res.json({
      success: true,
      data: { id: deleted.id },
      message: `Facility "${deleted.name}" deleted successfully`
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Search healthcare facilities
 */
const searchFacilities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const filters = FacilityService.sanitizeSearchFilters(req.query);
    
    const result = await FacilityService.searchFacilities(filters, page, limit);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Find nearest healthcare facilities by location
 */
const getNearestFacilities = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 10, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        message: "Latitude (lat) and longitude (lng) are required"
      });
    }

    const facilities = await FacilityService.findNearestFacilities(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius), 
      parseInt(limit), 
      type
    );
    
    res.json({
      success: true,
      data: facilities,
      query_params: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_meters: parseFloat(radius),
        type: type || 'all',
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Get facilities by type/category
 */
const getFacilitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const { city, operator } = req.query;

    const result = await FacilityService.getFacilitiesByType(type, page, limit, { city, operator });
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filter: {
        type: type.toLowerCase(),
        city: city || null,
        operator: operator || null
      }
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Get facilities within a polygon area
 */
const getFacilitiesInArea = async (req, res) => {
  try {
    const { polygon, type, limit = 100 } = req.body;

    const facilities = await FacilityService.findFacilitiesInArea(polygon, type, limit);
    
    res.json({
      success: true,
      data: facilities,
      query_params: {
        polygon_area: polygon,
        type: type || 'all',
        limit: parseInt(limit),
        total_found: facilities.length
      }
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Get facility statistics by type
 */
const getFacilityStats = async (req, res) => {
  try {
    const { city } = req.query;
    const stats = await FacilityService.getFacilityStats(city);
    
    res.json({
      success: true,
      data: stats,
      filter: {
        city: city || 'all'
      }
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

/**
 * Debug endpoint to check database content
 */
const debugDatabase = async (req, res) => {
  try {
    const pool = require("../db");
    
    // Check table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'health_facilities_points'
      ORDER BY ordinal_position
    `);
    
    // Check total count
    const totalCount = await pool.query("SELECT COUNT(*) FROM health_facilities_points");
    
    // Get sample records
    const sampleData = await pool.query(`
      SELECT ogc_fid, name, amenity, healthcare, addr_city, 
             ST_AsText(geom) as geom_text,
             ST_GeometryType(geom) as geom_type,
             ST_SRID(geom) as srid
      FROM health_facilities_points 
      LIMIT 5
    `);
    
    // Check pharmacy data specifically
    const pharmacyCount = await pool.query(`
      SELECT COUNT(*) FROM health_facilities_points 
      WHERE amenity = 'pharmacy' OR healthcare = 'pharmacy'
    `);
    
    res.json({
      success: true,
      debug_info: {
        table_structure: tableInfo.rows,
        total_records: parseInt(totalCount.rows[0].count),
        pharmacy_records: parseInt(pharmacyCount.rows[0].count),
        sample_data: sampleData.rows,
        test_location: {
          lat: 10.2360937,
          lng: 105.4020621,
          note: "Location used in your test"
        }
      }
    });
  } catch (err) {
    handleControllerError(res, err);
  }
};

module.exports = {
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  searchFacilities,
  getNearestFacilities,
  getFacilitiesByType,
  getFacilitiesInArea,
  getFacilityStats,
  debugDatabase
};