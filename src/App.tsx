import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { apiService } from './services/apiService';
import type { HealthFacility } from './types';
import './App.css';

function App() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllFacilities() as HealthFacility[];
        setFacilities(data);
      } catch (err) {
        setError('Failed to fetch facilities');
        console.error('Error fetching facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Healthcare Facilities</h2>
          <p className="text-gray-600">Manage and monitor healthcare facilities</p>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading facilities...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Facilities ({facilities.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {facilities.slice(0, 10).map((facility) => (
                <div key={facility.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {facility.name_vi || facility.name || 'Unnamed Facility'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {facility.healthcare && `Type: ${facility.healthcare}`}
                        {facility.addr_city && ` • City: ${facility.addr_city}`}
                        {facility.amenity && ` • Amenity: ${facility.amenity}`}
                      </p>
                      {facility.addr_full && (
                        <p className="text-xs text-gray-400 mt-1">
                          Address: {facility.addr_full}
                        </p>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
