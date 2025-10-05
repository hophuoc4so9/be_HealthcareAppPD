import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { getCurrentLocation, formatDistance, getFacilityTypeVi, getFacilityIcon } from '../utils/geoUtils';

interface Facility {
  id: number;
  name: string;
  name_vi?: string;
  amenity?: string;
  healthcare?: string;
  building?: string;
  addr_city?: string;
  addr_full?: string;
  operator?: string;
  distance_meters?: number;
}

const NearbyFacilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [radius, setRadius] = useState(5000);
  const [stats, setStats] = useState<any>(null);

  const facilityTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pharmacy', label: 'Nhà thuốc' },
    { value: 'hospital', label: 'Bệnh viện' },
    { value: 'clinic', label: 'Phòng khám' },
    { value: 'dentist', label: 'Nha khoa' },
    { value: 'doctor', label: 'Bác sĩ' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getFacilityStats() as any;
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const getUserLocationAndSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Search nearby facilities
      await searchNearbyFacilities(location.lat, location.lng);
    } catch (err: any) {
      setError(err.message || 'Không thể lấy vị trí của bạn');
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyFacilities = async (lat: number, lng: number) => {
    try {
      const params: any = {
        lat,
        lng,
        radius,
        limit: 20,
      };

      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      const response = await apiService.getNearestFacilities(params) as any;
      setFacilities(response.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tìm kiếm cơ sở y tế');
    }
  };

  const searchByType = async (type: string) => {
    if (type === 'all') {
      setFacilities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getFacilitiesByType(type as any, {
        limit: 50,
      }) as any;
      setFacilities(response.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tìm kiếm theo loại');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (userLocation && type !== 'all') {
      searchNearbyFacilities(userLocation.lat, userLocation.lng);
    } else if (type !== 'all') {
      searchByType(type);
    } else {
      setFacilities([]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tìm Cơ Sở Y Tế</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng số</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.by_type.pharmacy}</div>
            <div className="text-sm text-gray-600">Nhà thuốc</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats.by_type.hospital}</div>
            <div className="text-sm text-gray-600">Bệnh viện</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.by_type.clinic}</div>
            <div className="text-sm text-gray-600">Phòng khám</div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.by_type.dentist}</div>
            <div className="text-sm text-gray-600">Nha khoa</div>
          </div>
          <div className="bg-indigo-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.by_type.doctor}</div>
            <div className="text-sm text-gray-600">Bác sĩ</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {facilityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Bán kính:</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1km</option>
              <option value={2000}>2km</option>
              <option value={5000}>5km</option>
              <option value={10000}>10km</option>
              <option value={20000}>20km</option>
            </select>
          </div>

          <button
            onClick={getUserLocationAndSearch}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '📍'
            )}
            Tìm gần tôi
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User location */}
      {userLocation && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Vị trí của bạn: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tìm kiếm...</p>
        </div>
      )}

      {/* Results */}
      {!loading && facilities.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Tìm thấy {facilities.length} cơ sở y tế
            {selectedType !== 'all' && ` (${facilityTypes.find(t => t.value === selectedType)?.label})`}
          </h2>

          <div className="grid gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getFacilityIcon(facility.amenity, facility.healthcare)}
                      </span>
                      <h3 className="text-lg font-semibold">
                        {facility.name_vi || facility.name}
                      </h3>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {getFacilityTypeVi(facility.amenity, facility.healthcare)}
                      </span>
                    </div>

                    <div className="text-gray-600 space-y-1">
                      {facility.addr_full && (
                        <p>📍 {facility.addr_full}</p>
                      )}
                      {facility.addr_city && (
                        <p>🏙️ {facility.addr_city}</p>
                      )}
                      {facility.operator && (
                        <p>🏢 {facility.operator}</p>
                      )}
                    </div>
                  </div>

                  {facility.distance_meters !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatDistance(facility.distance_meters)}
                      </div>
                      <div className="text-sm text-gray-500">khoảng cách</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && facilities.length === 0 && selectedType !== 'all' && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy cơ sở y tế nào. Thử thay đổi bộ lọc hoặc tăng bán kính tìm kiếm.
        </div>
      )}
    </div>
  );
};

export default NearbyFacilities;