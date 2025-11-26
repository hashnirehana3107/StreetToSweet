import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const driverAPI = axios.create({
  baseURL: `${API_BASE_URL}/driver`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
driverAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
driverAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const driverService = {
  // Get driver dashboard data
  getDashboard: async () => {
    try {
      const response = await driverAPI.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  },

  // Convenience: update only driver location without changing availability
  updateLocation: async (coordinates) => {
    try {
      // Send only coordinates; backend will ignore undefined availability
      const response = await driverAPI.put('/availability', {
        coordinates
      });
      return response.data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  },

  // Update driver availability and location
  updateAvailability: async (availability, coordinates, notes) => {
    try {
      const response = await driverAPI.put('/availability', {
        availability,
        coordinates,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Update availability error:', error);
      throw error;
    }
  },

  // Get assigned rescue requests
  getAssignedTasks: async () => {
    try {
      const response = await driverAPI.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Get assigned tasks error:', error);
      throw error;
    }
  },

  // Update rescue request status
  updateTaskStatus: async (taskId, status, notes, coordinates, hospitalId) => {
    try {
      const response = await driverAPI.put(`/tasks/${taskId}/status`, {
        status,
        notes,
        coordinates,
        hospitalId
      });
      return response.data;
    } catch (error) {
      console.error('Update task status error:', error);
      throw error;
    }
  },

  // Get nearby rescue requests and hospitals
  getNearbyReports: async (latitude, longitude, radius = 20) => {
    try {
      const response = await driverAPI.get('/nearby-reports', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Get nearby reports error:', error);
      throw error;
    }
  },

  // Lightweight realtime updates (stub/polling fallback)
  getRealtimeUpdates: async () => {
    try {
      // If backend doesn’t provide a dedicated updates endpoint, return an empty update set
      // You can enhance this later to diff `/dashboard` data or use WebSocket events
      return {
        status: 'success',
        data: {
          newEmergencies: [],
          updatedRequests: [],
          notifications: []
        }
      };
    } catch (error) {
      console.error('Get realtime updates error:', error);
      throw error;
    }
  },

  // Accept or decline assignment
  respondToAssignment: async (requestId, response, reason, estimatedArrival) => {
    try {
      const apiResponse = await driverAPI.put(`/assignments/${requestId}/respond`, {
        response,
        reason,
        estimatedArrival
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Respond to assignment error:', error);
      throw error;
    }
  },

  // Upload photos for rescue
  uploadRescuePhotos: async (requestId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('photos', file);
      });

      const response = await driverAPI.post(`/rescue/${requestId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload rescue photos error:', error);
      throw error;
    }
  },

  // Get hospitals
  getHospitals: async (province, city, emergency, latitude, longitude) => {
    try {
      const response = await driverAPI.get('/hospitals', {
        params: { province, city, emergency, latitude, longitude }
      });
      return response.data;
    } catch (error) {
      console.error('Get hospitals error:', error);
      throw error;
    }
  },

  // Get driver statistics
  getDriverStats: async (period = 'month') => {
    try {
      const response = await driverAPI.get('/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get driver stats error:', error);
      throw error;
    }
  }
};

// Additional helpers used by the Driver Dashboard UI
// ---------------- PDF Download Helpers ----------------
const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

driverService.downloadRescueReportPDF = async (requestId) => {
  try {
    const response = await driverAPI.get(`/reports/${requestId}/pdf`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const filename = `rescue-report-${requestId}.pdf`;
    triggerDownload(blob, filename);
    return { status: 'success' };
  } catch (error) {
    console.error('Download rescue report PDF error:', error);
    throw error;
  }
};

driverService.downloadFullHistoryPDF = async (period = 'all') => {
  try {
    const response = await driverAPI.get(`/reports/history/pdf`, {
      params: { period },
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const filename = `driver-history-${period}.pdf`;
    triggerDownload(blob, filename);
    return { status: 'success' };
  } catch (error) {
    console.error('Download full history PDF error:', error);
    throw error;
  }
};

driverService.getQuickLocations = async () => {
  // Static Sri Lanka locations as quick picks; replace with backend data when available
  return {
    status: 'success',
    data: [
      { id: 'cmb', name: 'Colombo', coordinates: { lat: 6.9271, lng: 79.8612 } },
      { id: 'kdy', name: 'Kandy', coordinates: { lat: 7.2906, lng: 80.6337 } },
      { id: 'gll', name: 'Galle', coordinates: { lat: 6.0535, lng: 80.2200 } },
      { id: 'jfn', name: 'Jaffna', coordinates: { lat: 9.6615, lng: 80.0255 } },
      { id: 'nuw', name: 'Nuwara Eliya', coordinates: { lat: 6.9497, lng: 80.7891 } }
    ]
  };
};

driverService.geocodeAddress = async (address) => {
  try {
    // Use Nominatim (OpenStreetMap) for simple geocoding; no API key required
    const url = `https://nominatim.openstreetmap.org/search`;
    const response = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        addressdetails: 0,
        limit: 1
      },
      headers: {
        // Identify your app politely per Nominatim usage policy
        'Accept-Language': 'en',
      }
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      const item = response.data[0];
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocode address error:', error);
    throw error;
  }
};

export default driverService;
