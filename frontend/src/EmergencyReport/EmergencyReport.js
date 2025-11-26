import React, { useState, useContext, useEffect, useRef } from 'react';
import { EmergencyContext } from '../EmergencyContext/EmergencyContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EmergencyReport.css';

const manualMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 25],
});

const LocationPicker = ({ formData, setFormData }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData({ ...formData, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
    }
  });

  // Validate coordinates before rendering marker
  const hasValidCoords = formData.latitude && formData.longitude && 
                        !isNaN(parseFloat(formData.latitude)) && 
                        !isNaN(parseFloat(formData.longitude)) &&
                        parseFloat(formData.latitude) >= -90 && parseFloat(formData.latitude) <= 90 &&
                        parseFloat(formData.longitude) >= -180 && parseFloat(formData.longitude) <= 180;

  return hasValidCoords
    ? <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} icon={manualMarkerIcon} />
    : null;
};

// Component to auto-center map when selectedLocation changes
const MapAutoCenter = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 15); // zoom closer on selected location
    }
  }, [location, map]);

  return null;
};

const EmergencyReport = () => {
  const { addReport, selectLocation, selectedLocation, alerts, loading, error, clearError } = useContext(EmergencyContext);

  const [formData, setFormData] = useState({
    dayName: '',
    dogName: '',
    phoneImage: null,
    phoneImagePreview: null,
    locationAddress: '',
    latitude: '',
    longitude: '',
    condition: '',
    yourName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, phoneImage: file, phoneImagePreview: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate and parse coordinates with better error handling
    let lat = 7.8731; // Default to Colombo, Sri Lanka
    let lng = 80.7718;

    if (formData.latitude && formData.latitude.trim() !== '') {
      const parsedLat = parseFloat(formData.latitude);
      if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
        lat = parsedLat;
      } else {
        alert('Please enter a valid latitude between -90 and 90.');
        setIsSubmitting(false);
        return;
      }
    }

    if (formData.longitude && formData.longitude.trim() !== '') {
      const parsedLng = parseFloat(formData.longitude);
      if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
        lng = parsedLng;
      } else {
        alert('Please enter a valid longitude between -180 and 180.');
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare data for backend
    const reportData = {
      dayName: formData.dayName,
      dogName: formData.dogName || "Unknown Dog",
      locationAddress: formData.locationAddress,
      latitude: lat,
      longitude: lng,
      condition: formData.condition,
      yourName: formData.yourName
    };

    try {
      // Clear any previous errors
      clearError();

      // Submit to backend via context
      const result = await addReport(reportData, formData.phoneImage);

      if (result.success) {
        alert('🚨 Emergency report submitted successfully!');
        
        // Reset form
        setFormData({
          dayName: '',
          dogName: '',
          phoneImage: null,
          phoneImagePreview: null,
          locationAddress: '',
          latitude: '',
          longitude: '',
          condition: '',
          yourName: ''
        });
      } else {
        alert('Failed to submit report: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setFormData({ ...formData, latitude, longitude });
        selectLocation([latitude, longitude]);
      });
    } else alert("Geolocation not supported by this browser.");
  };

  return (
    <div className="e-emergency-report-container">
      <h1>Emergency Rescue Report</h1>

      {/* Display error message if any */}
      {error && (
        <div className="e-error-message" style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #fcc'
        }}>
          {error}
          <button onClick={clearError} style={{ float: 'right', background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Display loading state */}
      {loading && (
        <div className="e-loading-message" style={{
          backgroundColor: '#e6f3ff',
          color: '#0066cc',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #cce6ff'
        }}>
          Processing your request...
        </div>
      )}

      <form onSubmit={handleSubmit} className="e-emergency-form">
        {/* Form fields same as before 
        <div className="e-form-group">
          <label>Day Name *</label>
          <input type="text" name="dayName" value={formData.dayName} onChange={handleChange} required />
        </div>
        <div className="e-form-group">
          <label>Dog Name (optional)</label>
          <input type="text" name="dogName" value={formData.dogName} onChange={handleChange} />
        </div>*/}
        <div className="e-form-group">
          <label>Upload Phone Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {formData.phoneImagePreview && <img src={formData.phoneImagePreview} alt="Preview" style={{ width: 120, marginTop: 10, borderRadius: 8 }} />}
        </div>
        <div className="e-form-group">
          <label>Location Address *</label>
          <textarea name="locationAddress" value={formData.locationAddress} onChange={handleChange} required rows="3" />
          <button type="button" onClick={handleAutoLocation}>Use Current Location</button>
        </div>
        <div className="e-coordinate-group">
          <div className="e-form-group">
            <label>Latitude (optional)</label>
            <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} />
          </div>
          <div className="e-form-group">
            <label>Longitude (optional)</label>
            <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} />
          </div>
        </div>
        <div className="e-form-group">
          <label>Condition *</label>
          <select name="condition" value={formData.condition} onChange={handleChange} required>
            <option value="">Select condition</option>
            <option value="critical">Critical</option>
            <option value="injured">Injured</option>
            <option value="serious">Serious</option>
            <option value="stable">Stable</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="e-form-group">
          <label>Your Name *</label>
          <input type="text" name="yourName" value={formData.yourName} onChange={handleChange} required />
        </div>

        <button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      {/* Map */}
      <div className="e-form-map">
        <h4>Pick location manually (optional)</h4>
        <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '350px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker formData={formData} setFormData={setFormData} />
          <MapAutoCenter location={selectedLocation} />
        </MapContainer>
      </div>

      {/* Alerts */}
      <div className="e-alerts">
        <h3>Recent Alerts</h3>
        <ul>
          {alerts.slice(-5).reverse().map(alert => (
            <li key={alert.id}>
              {alert.message} ({alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmergencyReport;
