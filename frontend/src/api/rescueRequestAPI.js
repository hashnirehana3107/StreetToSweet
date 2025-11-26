// API service for rescue requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class RescueRequestAPI {
    constructor() {
        this.baseURL = `${API_BASE_URL}/rescue-requests`;
    }

    // Helper method for API calls
    async apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const config = {
            method,
            headers: {}
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Handle form data vs JSON
        if (data) {
            if (isFormData) {
                config.body = data;
            } else {
                config.headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${method} ${url}:`, error);
            throw error;
        }
    }

    // Submit a new rescue request
    async submitRescueRequest(formData) {
        const apiFormData = new FormData();
        
        // Add text fields
        apiFormData.append('description', formData.description);
        apiFormData.append('location', formData.location);
        apiFormData.append('urgency', formData.urgency);
        apiFormData.append('animalType', formData.animalType);
        apiFormData.append('contactInfo', formData.contactInfo);
        apiFormData.append('reporterName', formData.reporterName || 'Anonymous');
        apiFormData.append('reporterPhone', formData.reporterPhone || formData.contactInfo);
        apiFormData.append('reporterEmail', formData.reporterEmail || '');
        
        // Add coordinates if available
        if (formData.coordinates) {
            apiFormData.append('coordinates', JSON.stringify(formData.coordinates));
        }

        // Add photos
        if (formData.photos && formData.photos.length > 0) {
            formData.photos.forEach((photo, index) => {
                apiFormData.append('photos', photo);
            });
        }

        return await this.apiCall('', 'POST', apiFormData, true);
    }

    // Get all rescue requests (for dashboard)
    async getAllRescueRequests(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.excludeEmergency !== undefined) params.append('excludeEmergency', String(filters.excludeEmergency));

        const endpoint = params.toString() ? `?${params.toString()}` : '';
        return await this.apiCall(endpoint);
    }

    // Get user's own rescue requests
    async getMyRescueRequests() {
        return await this.apiCall('/my-reports');
    }

    // Get rescue request by ID
    async getRescueRequestById(id) {
        return await this.apiCall(`/${id}`);
    }

    // Update rescue request status
    async updateRescueRequestStatus(id, status, notes = '') {
        return await this.apiCall(`/${id}/status`, 'PUT', { status, notes });
    }

    // Update rescue request
async updateRescueRequest(id, updateData) {
    return await this.apiCall(`/${id}`, 'PUT', updateData);
}

// Delete rescue request
async deleteRescueRequest(id) {
    return await this.apiCall(`/${id}`, 'DELETE');
}

    // Assign driver to rescue request
    async assignDriverToRequest(id, driverId, driverName, estimatedArrival = null) {
        return await this.apiCall(`/${id}/assign`, 'PUT', {
            driverId,
            driverName,
            estimatedArrival
        });
    }

    // Get available drivers for assignment
    async getAvailableDrivers() {
        return await this.apiCall('/drivers');
    }
}



export default new RescueRequestAPI();
