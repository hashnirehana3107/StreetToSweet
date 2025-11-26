import React, { createContext, useState, useEffect } from 'react';
import EmergencyService from '../services/emergencyService';

export const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load reports and drivers from backend when component mounts
  useEffect(() => {
    loadReports();
    loadDrivers();
    loadNotifications();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await EmergencyService.getEmergencyReports();
      if (result.success) {
        setReports(result.data || []);
      }
    } catch (err) {
      setError('Failed to load emergency reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const result = await EmergencyService.getAvailableDrivers();
      if (result.success) {
        setDrivers(result.data || []);
      }
    } catch (err) {
      console.error('Error loading drivers:', err);
      // Use fallback drivers if API fails
      setDrivers([
        { id: 1, name: "Ruwan Silva", status: "available" },
        { id: 2, name: "Shanika Perera", status: "available" },
        { id: 3, name: "Nadeesha Jayawardena", status: "available" }
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const result = await EmergencyService.getNotifications({ limit: 50 });
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const addReport = async (reportData, imageFile = null) => {
    try {
      setLoading(true);
      setError(null);

      // Submit to backend
      const result = await EmergencyService.submitEmergencyReport(reportData, imageFile);
      
      if (result.success) {
        const newReport = result.data;
        
        // Update local state
        setReports(prev => [newReport, ...prev]);
        setSelectedLocation([newReport.location.lat, newReport.location.lng]);

        // Add alert
        setAlerts(prev => [
          ...prev,
          {
            id: Date.now(),
            message: `New emergency reported: ${newReport.dogName || 'Unknown Dog'}`,
            location: newReport.location
          }
        ]);

        return { success: true, data: newReport };
      }
    } catch (err) {
      setError('Failed to submit emergency report');
      console.error('Error submitting report:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, statusData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await EmergencyService.updateEmergencyReportStatus(reportId, statusData);
      
      if (result.success) {
        // Update local state
        setReports(prev => prev.map(report => 
          String(report.id) === String(reportId) 
            ? { ...report, ...result.data }
            : report
        ));
        
        // Reload notifications to get status update notification
        loadNotifications();
        
        return { success: true };
      }
    } catch (err) {
      setError('Failed to update report status');
      console.error('Error updating report:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = async (driverId, statusData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await EmergencyService.updateDriverStatus(driverId, statusData);
      
      if (result.success) {
        // Update local driver state
        setDrivers(prev => prev.map(driver => 
          String(driver.id) === String(driverId) 
            ? { ...driver, ...result.data }
            : driver
        ));
        
        // Reload notifications to get the new driver status notification
        loadNotifications();
        
        return { success: true };
      }
    } catch (err) {
      setError('Failed to update driver status');
      console.error('Error updating driver:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const result = await EmergencyService.markNotificationAsRead(notificationId);
      
      if (result.success) {
        // Update local notification state
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        ));
        return { success: true };
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: err.message };
    }
  };

  const selectLocation = (location) => {
    setSelectedLocation(location);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <EmergencyContext.Provider value={{
      reports,
      setReports,
      addReport,
      updateReportStatus,
      drivers,
      setDrivers,
      updateDriverStatus,
      notifications,
      setNotifications,
      markNotificationAsRead,
      selectedLocation,
      setSelectedLocation,
      alerts,
      setAlerts,
      selectLocation,
      loading,
      error,
      clearError,
      loadReports,
      loadDrivers,
      loadNotifications
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};
