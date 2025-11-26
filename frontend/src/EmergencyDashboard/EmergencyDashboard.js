import React, { useState, useEffect, useContext } from "react";
import './EmergencyDashboard.css';
import { EmergencyContext } from '../EmergencyContext/EmergencyContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const emergencyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
  iconSize: [30, 30],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  iconSize: [30, 30],
});

// Predefined hospitals
const petHospitals = [
  { name: "Colombo Pet Hospital", location: { lat: 6.9271, lng: 79.8612 } },
  { name: "Kandy Animal Care", location: { lat: 7.2906, lng: 80.6337 } },
  { name: "Galle Vet Clinic", location: { lat: 6.0356, lng: 80.2140 } },
  { name: "Negombo Vet Clinic", location: { lat: 7.2089, lng: 79.8352 } },
];

const EmergencyDashboard = () => {
  const { 
    reports, 
    alerts, 
    setAlerts, 
    selectedLocation, 
    updateReportStatus,
    drivers,
    updateDriverStatus,
    notifications,
    markNotificationAsRead,
    loading, 
    error, 
    loadReports,
    loadDrivers,
    loadNotifications
  } = useContext(EmergencyContext);

  // Track selected drivers per report: { [reportId]: driverId }
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [activeTab, setActiveTab] = useState('reports');
  const [heartbeat, setHeartbeat] = useState("🟢 Alive");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRedLightAlert, setShowRedLightAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]);
  const [mapZoom, setMapZoom] = useState(7);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(prev => prev === "🟢 Alive" ? "🟡 Checking..." : "🟢 Alive");
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show emergency alert
  useEffect(() => {
    if (alerts.length > 0) {
      setCurrentAlert(alerts[0]);
      setShowRedLightAlert(true);

      const timer = setTimeout(() => dismissAlert(), 7000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  // Auto-zoom when new report added or selectedLocation changed
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter(selectedLocation);
      setMapZoom(15);
      setActiveTab('map');
    } else if (reports.length > 0) {
      const latestReport = reports[reports.length - 1];
      setMapCenter([latestReport.location.lat, latestReport.location.lng]);
      setMapZoom(13);
      setActiveTab('map');
    }
  }, [selectedLocation, reports]);

  const handleAssignDriver = async (reportId) => {
    const chosenDriverId = selectedDrivers[reportId];
    if (!chosenDriverId) return alert("Select a driver first");

    // Ensure we compare IDs as strings (backend uses Mongo _id strings)
    const driver = drivers.find(d => String(d.id) === String(chosenDriverId));
    if (!driver) {
      alert('Selected driver not found');
      return;
    }
    
    try {
      // Update via API
      const result = await updateReportStatus(reportId, { 
        status: 'assigned', 
        driverId: chosenDriverId 
      });

      if (result.success) {
        // Update local driver status
        await updateDriverStatus(driver.id, { status: "on mission" });
        // Reset selection only for this report
        setSelectedDrivers(prev => {
          const next = { ...prev };
          delete next[reportId];
          return next;
        });
        
        // Add local notification for immediate feedback
        const newNotification = {
          id: Date.now(),
          message: `Assigned case #${reportId} to ${driver.name}`,
          type: "assignment",
          createdAt: new Date().toISOString(),
          isRead: false
        };
        
        // This will be replaced by backend notifications when they reload
        setTimeout(() => loadNotifications(), 1000);
      } else {
        alert('Failed to assign driver');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver');
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      const result = await updateReportStatus(reportId, { status: newStatus });
      
      if (result.success) {
        // Reload notifications to get the status update notification
        setTimeout(() => loadNotifications(), 1000);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="status-badge pending">🟡 Pending</span>;
      case 'assigned': return <span className="status-badge assigned">🚚 Assigned</span>;
      case 'rescued': return <span className="status-badge rescued">✅ Rescued</span>;
      default: return <span className="status-badge">Unknown</span>;
    }
  };

  const filteredReports = reports.filter(r =>
    (r.dogName && r.dogName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const dismissAlert = () => {
    setShowRedLightAlert(false);
    setCurrentAlert(null);
    setAlerts([]);
  };

  const focusOnReport = (report) => {
    setMapCenter([report.location.lat, report.location.lng]);
    setMapZoom(15);
    setActiveTab('map');
  };

  // Determine if a driver is available (handles different backend shapes)
  const isDriverAvailable = (d) => {
    if (!d) return false;
    // status can be a string ("available") or an array
    if (typeof d.status === 'string') {
      return d.status.toLowerCase().includes('available');
    }
    if (Array.isArray(d.status)) {
      return d.status.some(s => String(s).toLowerCase().includes('available'));
    }
    // Some endpoints provide availability as an array
    if (Array.isArray(d.availability)) {
      return d.availability.some(s => String(s).toLowerCase().includes('available'));
    }
    // Some endpoints expose a boolean flag
    if (typeof d.available === 'boolean') {
      return d.available;
    }
    return false;
  };

  // Prefer available drivers; if none detected (due to data shape), show all
  const availableDrivers = Array.isArray(drivers) ? drivers.filter(isDriverAvailable) : [];
  const driversToShow = availableDrivers.length > 0 ? availableDrivers : (drivers || []);

  return (
    <div className="emergency-dashboard">

      {/* Emergency Alert Overlay */}
      {showRedLightAlert && currentAlert && (
        <div className="red-light-alert-overlay">
          <div className="red-light-alert">
            <div className="alert-header">
              <span className="alert-siren">🚨 EMERGENCY ALERT 🚨</span>
              <button className="alert-dismiss-btn" onClick={dismissAlert}>✖</button>
            </div>
            <div className="alert-body">
              <p>{currentAlert.message}</p>
              {currentAlert.location && <p><strong>Location:</strong> {currentAlert.location.lat}, {currentAlert.location.lng}</p>}
            </div>
            <div className="alert-flash"></div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <h1>🐕 Emergency Rescue Dashboard - Sri Lanka</h1>
        <div className="header-actions">
          {alerts.length > 0 && <div className="alert-indicator" onClick={() => setShowRedLightAlert(true)}>🔴 {alerts.length}</div>}
          <span className="heartbeat">{heartbeat}</span>
          <button className="btn-refresh" onClick={() => {
            loadReports();
            loadDrivers(); 
            loadNotifications();
          }}>🔄 Refresh</button>
        </div>
      </header>

      {/* Display error message if any */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Display loading state */}
      {loading && (
        <div className="loading-message" style={{
          backgroundColor: '#e6f3ff',
          color: '#0066cc',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          border: '1px solid #cce6ff'
        }}>
          Loading emergency reports...
        </div>
      )}

      <div className="dashboard-tabs">
        <button className={activeTab === 'reports' ? 'tab active' : 'tab'} onClick={() => setActiveTab('reports')}>Reports</button>
        <button className={activeTab === 'map' ? 'tab active' : 'tab'} onClick={() => setActiveTab('map')}>Live Map</button>
        <button className={activeTab === 'drivers' ? 'tab active' : 'tab'} onClick={() => setActiveTab('drivers')}>Driver Status</button>
        <button className={activeTab === 'notifications' ? 'tab active' : 'tab'} onClick={() => setActiveTab('notifications')}>Notifications ({notifications.length})</button>
      </div>

      <div className="dashboard-content">

        {/* Reports Section */}
        {activeTab === 'reports' && (
          <div className="reports-section">
            <h2>Incoming Reports</h2>
            <input type="text" placeholder="Search by dog or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
            <div className="reports-list">
              {filteredReports.map(r => (
                <div key={r.id} className={`report-card ${r.condition === 'critical' || r.condition === 'Injured' ? 'urgent' : ''}`}>
                  <div className="report-header">
                    <h3>{r.dogName}</h3>
                    {getStatusBadge(r.status)}
                  </div>
                  <img src={r.photo ? `http://localhost:3000${r.photo}` : "https://placedog.net/100/100"} alt={r.dogName} className="dog-photo" />
                  <p><strong>Location:</strong> {r.address}</p>
                  <p><strong>Condition:</strong> {r.condition}</p>
                  <p><strong>Reported by:</strong> {r.reportedBy}</p>

                  <div className="report-actions">
                    <button className="btn-view-on-map" onClick={() => focusOnReport(r)}>View on Map</button>
                    <select
                      value={selectedDrivers[r.id] || ''}
                      onChange={e => setSelectedDrivers(prev => ({ ...prev, [r.id]: e.target.value }))}
                    >
                      <option value="">Select Driver</option>
                      {driversToShow.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}{!isDriverAvailable(d) ? ' (Unavailable)' : ''}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleAssignDriver(r.id)} disabled={r.status !== 'pending'}>Assign Driver</button>
                    <button onClick={() => updateStatus(r.id, 'rescued')} disabled={r.status === 'pending'}>Mark Rescued</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Section */}
        {activeTab === 'map' && (
          <div className="map-section">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '500px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

              {reports.filter(r => {
                // Only render markers with valid coordinates
                return r.location && 
                       typeof r.location.lat === 'number' && 
                       typeof r.location.lng === 'number' &&
                       !isNaN(r.location.lat) && 
                       !isNaN(r.location.lng) &&
                       r.location.lat >= -90 && r.location.lat <= 90 &&
                       r.location.lng >= -180 && r.location.lng <= 180;
              }).map(r => (
                <Marker key={r.id} position={[r.location.lat, r.location.lng]} icon={emergencyIcon}>
                  <Popup>
                    <strong>{r.dogName}</strong><br />
                    Condition: {r.condition}<br />
                    Status: {r.status}<br />
                    <div style={{ margin: '8px 0' }}>
                      <select
                        value={selectedDrivers[r.id] || ''}
                        onChange={e => setSelectedDrivers(prev => ({ ...prev, [r.id]: e.target.value }))}
                        style={{ width: '100%' }}
                      >
                        <option value="">Select Driver</option>
                        {driversToShow.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}{!isDriverAvailable(d) ? ' (Unavailable)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => handleAssignDriver(r.id)} disabled={r.status !== 'pending'}>Assign Driver</button>
                  </Popup>
                </Marker>
              ))}

              {petHospitals.map((h, index) => (
                <Marker key={index} position={[h.location.lat, h.location.lng]} icon={hospitalIcon}>
                  <Popup>{h.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Driver Section */}
        {activeTab === 'drivers' && (
          <div className="drivers-section">
            <h2>Driver Status</h2>
            <ul>
              {drivers.map(d => (
                <li key={d.id}>{d.name} - {isDriverAvailable(d) ? '🟢 Available' : '🚚 On Mission'}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notifications Section */}
        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              <ul>
                {notifications.map(n => (
                  <li 
                    key={n.id} 
                    className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                    onClick={() => !n.isRead && markNotificationAsRead(n.id)}
                    style={{
                      padding: '10px',
                      margin: '5px 0',
                      backgroundColor: n.isRead ? '#f5f5f5' : '#e6f3ff',
                      borderLeft: `4px solid ${n.priority === 'critical' ? '#ff4444' : n.priority === 'high' ? '#ff8800' : '#0066cc'}`,
                      cursor: n.isRead ? 'default' : 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                      {n.timeAgo || new Date(n.createdAt).toLocaleString()}
                      {n.type && <span style={{ marginLeft: '10px', padding: '2px 6px', backgroundColor: '#ddd', borderRadius: '3px', fontSize: '0.7em' }}>
                        {n.type.replace('_', ' ').toUpperCase()}
                      </span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default EmergencyDashboard;
