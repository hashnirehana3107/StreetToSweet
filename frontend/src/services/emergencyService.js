const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Emergency Report API service
class EmergencyService {
    
    // Submit emergency report
    static async submitEmergencyReport(reportData, imageFile = null) {
        try {
            const formData = new FormData();
            
            // Add form fields
            Object.keys(reportData).forEach(key => {
                if (reportData[key] !== null && reportData[key] !== undefined && reportData[key] !== '') {
                    formData.append(key, reportData[key]);
                }
            });
            
            // Add image file if provided
            if (imageFile) {
                formData.append('phoneImage', imageFile);
            }

            const response = await fetch(`${API_BASE_URL}/emergency-reports`, {
                method: 'POST',
                body: formData // Don't set Content-Type header when using FormData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Error submitting emergency report:', error);
            throw error;
        }
    }

    // Get all emergency reports
    static async getEmergencyReports(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const response = await fetch(`${API_BASE_URL}/emergency-reports?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching emergency reports:', error);
            throw error;
        }
    }

    // Update emergency report status
    static async updateEmergencyReportStatus(reportId, statusData) {
        try {
            const response = await fetch(`${API_BASE_URL}/emergency-reports/${reportId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(statusData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Error updating emergency report:', error);
            throw error;
        }
    }

    // Get available drivers (if needed)
    static async getAvailableDrivers() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/drivers`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching drivers:', error);
            // Return fallback data if API fails
            return {
                success: true,
                data: [
                    { id: 1, name: "Ruwan Silva", status: "available" },
                    { id: 2, name: "Shanika Perera", status: "available" },
                    { id: 3, name: "Nadeesha Jayawardena", status: "available" }
                ]
            };
        }
    }

    // Update driver status
    static async updateDriverStatus(driverId, statusData) {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/drivers/${driverId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(statusData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Error updating driver status:', error);
            throw error;
        }
    }

    // Get notifications
    static async getNotifications(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const response = await fetch(`${API_BASE_URL}/dashboard/notifications?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Create notification
    static async createNotification(notificationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

export default EmergencyService;
