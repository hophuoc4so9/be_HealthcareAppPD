const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/facilityController");

// @route   GET /api/facilities
// @desc    Get all facilities with pagination
// @access  Public
router.get("/", getAllFacilities);

// @route   GET /api/facilities/search
// @desc    Search facilities with advanced filters
// @access  Public
router.get("/search", searchFacilities);

// @route   GET /api/facilities/nearest
// @desc    Find nearest facilities by location
// @access  Public
router.get("/nearest", getNearestFacilities);

// @route   GET /api/facilities/stats
// @desc    Get facility statistics by type
// @access  Public
router.get("/stats", getFacilityStats);

// @route   GET /api/facilities/debug
// @desc    Debug database content and structure
// @access  Public (remove in production)
router.get("/debug", debugDatabase);

// @route   GET /api/facilities/type/:type
// @desc    Get facilities by type (pharmacy, hospital, clinic, dentist, doctor)
// @access  Public
router.get("/type/:type", getFacilitiesByType);

// @route   POST /api/facilities/in-area
// @desc    Get facilities within a polygon area
// @access  Public
router.post("/in-area", getFacilitiesInArea);

// @route   POST /api/facilities
// @desc    Create new facility
// @access  Public (should be protected in production)
router.post("/", createFacility);

// @route   GET /api/facilities/:id
// @desc    Get facility by ID
// @access  Public
router.get("/:id", getFacilityById);

// @route   PUT /api/facilities/:id
// @desc    Update facility by ID
// @access  Public (should be protected in production)
router.put("/:id", updateFacility);

// @route   DELETE /api/facilities/:id
// @desc    Delete facility by ID
// @access  Public (should be protected in production)
router.delete("/:id", deleteFacility);

module.exports = router;