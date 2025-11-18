const pool = require('../db');

class SeedController {
  /**
   * Seed facilities data
   * POST /api/seed/facilities
   */
  async seedFacilities(req, res, next) {
    try {
      const { facilities } = req.body;

      if (!Array.isArray(facilities) || facilities.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of facilities'
        });
      }

      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS health_facilities_points (
          ogc_fid SERIAL PRIMARY KEY,
          geom GEOMETRY(Point, 4326),
          name TEXT,
          name_en TEXT,
          name_vi TEXT,
          amenity TEXT,
          building TEXT,
          healthcare TEXT,
          healthca_1 TEXT,
          operator_t TEXT,
          capacity_p TEXT,
          addr_full TEXT,
          addr_city TEXT,
          source TEXT,
          osm_id BIGINT UNIQUE,
          osm_type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Create spatial index
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_health_facilities_geom 
        ON health_facilities_points USING GIST (geom)
      `);

      const results = [];
      let skipped = 0;

      for (const facility of facilities) {
        try {
          const query = `
            INSERT INTO health_facilities_points (
              osm_id, osm_type, name, name_en, name_vi,
              healthcare, healthca_1, amenity, building,
              operator_t, capacity_p, addr_full, addr_city, source,
              geom, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
              ST_SetSRID(ST_MakePoint($15, $16), 4326), NOW(), NOW()
            )
            ON CONFLICT (osm_id) DO UPDATE SET
              name = EXCLUDED.name,
              name_en = EXCLUDED.name_en,
              name_vi = EXCLUDED.name_vi,
              healthcare = EXCLUDED.healthcare,
              updated_at = NOW()
            RETURNING ogc_fid, osm_id, name
          `;

          const values = [
            facility.osm_id,
            facility.osm_type || null,
            facility.name || null,
            facility.name_en || null,
            facility.name_vi || null,
            facility.healthcare || null,
            facility.healthca_1 || null,
            facility.amenity || null,
            facility.building || null,
            facility.operator || null,
            facility.capacity || null,
            facility.addr_full || null,
            facility.addr_city || null,
            facility.source || null,
            facility.lng,
            facility.lat
          ];

          const result = await pool.query(query, values);
          results.push(result.rows[0]);
        } catch (err) {
          console.error(`Error inserting facility ${facility.osm_id}:`, err.message);
          skipped++;
        }
      }

      res.json({
        success: true,
        message: `Successfully seeded ${results.length} facilities (${skipped} skipped)`,
        data: {
          inserted: results.length,
          skipped,
          total: facilities.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get facility count
   * GET /api/seed/count
   */
  async getCount(req, res, next) {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM health_facilities_points');
      const count = parseInt(result.rows[0].count);

      res.json({
        success: true,
        data: {
          count,
          message: `Database has ${count} facilities`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear all facilities
   * DELETE /api/seed/facilities
   */
  async clearFacilities(req, res, next) {
    try {
      await pool.query('TRUNCATE TABLE health_facilities_points RESTART IDENTITY');
      
      res.json({
        success: true,
        message: 'All facilities cleared successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SeedController();
