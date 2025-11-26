// Volunteer Dashboard API Integration
// This file provides functions to connect the frontend with the backend
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000';

class VolunteerDashboardAPI {
    constructor() {
        // Prefer the global auth token set by AuthContext; fallback to legacy key
        this.token = localStorage.getItem('authToken') || localStorage.getItem('volunteerToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        // Store in the global auth key used across the app
        localStorage.setItem('authToken', token);
    }

    // Get authentication headers
    getHeaders(isFormData = false) {
        // Always read latest token (in case user logged in elsewhere)
        this.token = localStorage.getItem('authToken') || localStorage.getItem('volunteerToken');
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
        try {
            const config = {
                method,
                headers: this.getHeaders(isFormData)
            };

            // If no token present, surface a clear error before calling
            if (!config.headers['Authorization']) {
                throw new Error('Not authenticated');
            }

            if (data) {
                if (isFormData) {
                    config.body = data; // FormData object
                } else {
                    config.body = JSON.stringify(data);
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'API call failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        const result = await this.apiCall('/auth/login', 'POST', { email, password });
        if (result.status === 'success') {
            this.setToken(result.data.token);
        }
        return result;
    }

    // Dashboard Overview
    async getDashboardOverview() {
        return await this.apiCall('/volunteer/dashboard/overview');
    }

    // Tasks & Care Management
    async getAssignedTasks(status = null, dogId = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (dogId) params.append('dogId', dogId);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return await this.apiCall(`/volunteer/dashboard/tasks${query}`);
    }

    async completeTask(taskId, notes = '', actualDuration = null) {
        return await this.apiCall(
            `/volunteer/dashboard/tasks/${taskId}/complete`,
            'PUT',
            { notes, actualDuration }
        );
    }

    // Health Reporting
    async submitHealthReport(formData) {
        return await this.apiCall(
            '/volunteer/dashboard/health-reports',
            'POST',
            formData,
            true
        );
    }

    async getHealthReports(dogId = null, page = 1, limit = 10) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (dogId) params.append('dogId', dogId);
        
        return await this.apiCall(`/volunteer/dashboard/health-reports?${params.toString()}`);
    }

    // Dogs Management
    async getAvailableDogs() {
        return await this.apiCall('/volunteer/dashboard/dogs');
    }

    // Walking Tracker
    async logWalk(formData) {
        return await this.apiCall(
            '/volunteer/dashboard/walks',
            'POST',
            formData,
            true
        );
    }

    async getWalkingData(dogId = null, timeframe = 'all', page = 1, limit = 10) {
        const params = new URLSearchParams({
            timeframe,
            page: page.toString(),
            limit: limit.toString()
        });
        if (dogId) params.append('dogId', dogId);
        
        return await this.apiCall(`/volunteer/dashboard/walks?${params.toString()}`);
    }

    // Events Management
    async getUpcomingEvents(status = 'upcoming', page = 1, limit = 10) {
        const params = new URLSearchParams({
            status,
            page: page.toString(),
            limit: limit.toString()
        });
        
        return await this.apiCall(`/volunteer/dashboard/events?${params.toString()}`);
    }

    async registerForEvent(eventId) {
        return await this.apiCall(`/volunteer/dashboard/events/${eventId}/register`, 'POST');
    }

    async cancelEventRegistration(eventId) {
        return await this.apiCall(`/volunteer/dashboard/events/${eventId}/register`, 'DELETE');
    }

    // Blog & Stories
    async createBlogPost(formData) {
        return await this.apiCall(
            '/volunteer/dashboard/blog-posts',
            'POST',
            formData,
            true
        );
    }

    async getBlogPosts(status = null, page = 1, limit = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        if (status) params.append('status', status);
        
        return await this.apiCall(`/volunteer/dashboard/blog-posts?${params.toString()}`);
    }

    async updateBlogPost(postId, formData) {
        return await this.apiCall(
            `/volunteer/dashboard/blog-posts/${postId}`,
            'PUT',
            formData,
            true
        );
    }

    async deleteBlogPost(postId) {
        return await this.apiCall(`/volunteer/dashboard/blog-posts/${postId}`, 'DELETE');
    }

    // Helper methods for form data creation
    createHealthReportFormData(data, photos = []) {
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                // Do not append non-file 'photos' array from data; files are sent via 'healthPhotos'
                if (key === 'photos') return;
                formData.append(key, data[key]);
            }
        });
        
        photos.forEach((photo, index) => {
            formData.append('healthPhotos', photo);
        });
        
        return formData;
    }

    createWalkFormData(data, photos = []) {
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                if (key === 'activities' && Array.isArray(data[key])) {
                    // Handle activities array specially
                    formData.append('activities', JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            }
        });
        
        photos.forEach((photo, index) => {
            formData.append('walkPhotos', photo);
        });
        
        return formData;
    }


    // Get assigned dogs for the logged-in volunteer
    async getAssignedDogs() {
        try {
            const response = await axios.get(`${API_BASE_URL}/volunteer/dashboard/assigned-dogs`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned dogs:', error);
            throw error;
        }
    }

    // Get volunteer tasks (for logged-in volunteer)
    async getVolunteerTasks() {
        try {
            const response = await axios.get(`${API_BASE_URL}/volunteer/dashboard/tasks`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching volunteer tasks:', error);
            throw error;
        }
    }

    // Update task status
    async updateTaskStatus(taskId, status) {
        try {
            const response = await axios.put(`${API_BASE_URL}/volunteer/dashboard/tasks/${taskId}/status`, 
                { status },
                {
                    headers: this.getHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    }















    createBlogPostFormData(data, featuredImage = null) {
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        if (featuredImage) {
            formData.append('featuredImage', featuredImage);
        }
        
        return formData;
    }


    // Add these methods to your VolunteerDashboardAPI class

// Delete health report
async deleteHealthReport(reportId) {
  try {
    const response = await fetch(`${API_BASE_URL}/volunteer/dashboard/health-reports/${reportId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete health report');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting health report:', error);
    throw error;
  }
}

// Delete walk log
async deleteWalkLog(walkId) {
  try {
    const response = await fetch(`${API_BASE_URL}/volunteer/dashboard/walks/${walkId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete walk log');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting walk log:', error);
    throw error;
  }
}

// Get walk details (if needed)
async getWalkDetails(walkId) {
  return await this.apiCall(`/volunteer/dashboard/walks/${walkId}`);
}






}

// Usage examples:
/*
// Initialize API
const api = new VolunteerDashboardAPI();

// Login
await api.login('volunteer@example.com', 'password123');

// Get dashboard data
const overview = await api.getDashboardOverview();

// Submit health report
const healthData = {
    dogId: 'dog_id',
    eatingHabits: 'normal',
    mood: 'playful',
    weight: 25.5,
    observations: 'Dog is healthy and active'
};
const photos = [file1, file2]; // File objects
const formData = api.createHealthReportFormData(healthData, photos);
await api.submitHealthReport(formData);

// Log a walk
const walkData = {
    dogId: 'dog_id',
    distance: 2.5,
    duration: 45,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    notes: 'Great walk!'
};
const walkPhotos = [photoFile];
const walkFormData = api.createWalkFormData(walkData, walkPhotos);
await api.logWalk(walkFormData);

// Create blog post
const blogData = {
    title: 'My Blog Post',
    content: 'Content here...',
    category: 'volunteer_experience'
};
const featuredImage = imageFile;
const blogFormData = api.createBlogPostFormData(blogData, featuredImage);
await api.createBlogPost(blogFormData);
*/

// Export for use in React components
export default VolunteerDashboardAPI;