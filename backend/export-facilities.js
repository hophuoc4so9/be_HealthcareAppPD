require('dotenv').config();
const pool = require('./db');
const fs = require('fs');

async function exportFacilities() {
  try {
    console.log('📤 Exporting facilities from local database...');
    
    // First, check what columns exist
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'health_facilities_points'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Available columns:', columnsCheck.rows.map(r => r.column_name).join(', '));
    
    const result = await pool.query(`
      SELECT 
        osm_id, 
        name, 
        name_en,
        name_vi,
        healthcare, 
        healthca_1,
        amenity, 
        building,
        operator_t as operator,
        capacity_p as capacity,
        addr_full,
        addr_city,
        source,
        osm_type,
        ST_X(geom::geometry) as lng,
        ST_Y(geom::geometry) as lat
      FROM health_facilities_points
      WHERE geom IS NOT NULL
      ORDER BY osm_id
    `);
    
    const facilities = result.rows;
    
    fs.writeFileSync(
      'facilities_export.json',
      JSON.stringify({ facilities }, null, 2)
    );
    
    console.log(`✅ Exported ${facilities.length} facilities to facilities_export.json`);
    console.log('\n📝 Để import lên Render, chạy:');
    console.log('curl -X POST https://your-backend.onrender.com/api/seed/facilities \\');
    console.log('  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d @facilities_export.json');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportFacilities();
