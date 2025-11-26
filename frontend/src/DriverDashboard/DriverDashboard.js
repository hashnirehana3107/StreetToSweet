import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import './DriverDashboard.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { driverService } from '../services/driverService';

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const driverIcon = createCustomIcon('green');
const rescueIcon = createCustomIcon('red');
const hospitalIcon = createCustomIcon('blue');
const emergencyIcon = createCustomIcon('orange');
const locationIcon = createCustomIcon('violet');

// Fixed Routing component with proper cleanup
const Routing = ({ driverPosition, destination, color = '#0066cc' }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!driverPosition || !destination || !map || !isMountedRef.current) return;

    // Clean up previous routing control if it exists
    if (routingControlRef.current && map && isMountedRef.current) {
      try {
        if (map._container && !map._container._leaflet_disposed) {
          map.removeControl(routingControlRef.current);
        }
      } catch (error) {
        console.warn('Error removing previous routing control:', error);
      }
      routingControlRef.current = null;
    }

    // Create new routing control with error handling
    try {
      if (!isMountedRef.current) return;

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(driverPosition.lat, driverPosition.lng),
          L.latLng(destination.lat, destination.lng)
        ],
        routeWhileDragging: false,
        lineOptions: { styles: [{ color, weight: 4 }] },
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null // Disable default markers
      });

      if (map && routingControlRef.current && isMountedRef.current && map._container && !map._container._leaflet_disposed) {
        routingControlRef.current.addTo(map);
      }
    } catch (error) {
      console.error('Error creating routing control:', error);
    }

    // Cleanup function
    return () => {
      if (routingControlRef.current && map && isMountedRef.current) {
        try {
          if (map._container && !map._container._leaflet_disposed) {
            map.removeControl(routingControlRef.current);
          }
        } catch (error) {
          console.warn('Error during routing control cleanup:', error);
        } finally {
          routingControlRef.current = null;
        }
      }
    };
  }, [driverPosition, destination, map, color]);

  return null;
};

// Helper functions for nearest hospital
const getDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(coord1.lat * Math.PI/180) * Math.cos(coord2.lat * Math.PI/180) * Math.sin(dLng/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const findNearestHospital = (coord, hospitals) => {
  if (!hospitals || hospitals.length === 0) return null;
  let nearest = hospitals[0];
  let minDist = getDistance(coord, hospitals[0].coordinates);
  for (let i = 1; i < hospitals.length; i++) {
    const dist = getDistance(coord, hospitals[i].coordinates);
    if (dist < minDist) {
      minDist = dist;
      nearest = hospitals[i];
    }
  }
  return nearest;
};

// Location Selector Component
const LocationSelector = ({ onLocationSelect, nearbyHospitals, quickLocations = [] }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState('');

  const handleLocationClick = (lat, lng, name) => {
    const location = { lat, lng, name };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleCustomLocation = async () => {
    if (customLocation) {
      try {
        // Use geocoding service to get coordinates from address
        const location = await driverService.geocodeAddress(customLocation);
        setSelectedLocation(location);
        onLocationSelect(location);
      } catch (error) {
        console.error('Error geocoding address:', error);
        // Fallback: use center of available hospitals area
        if (nearbyHospitals.length > 0) {
          const avgLat = nearbyHospitals.reduce((sum, h) => sum + h.coordinates.lat, 0) / nearbyHospitals.length;
          const avgLng = nearbyHospitals.reduce((sum, h) => sum + h.coordinates.lng, 0) / nearbyHospitals.length;
          const location = { lat: avgLat, lng: avgLng, name: customLocation };
          setSelectedLocation(location);
          onLocationSelect(location);
        }
      }
    }
  };

  return (
    <div className="location-selector">
      <h3>Select Location to Find Nearby Hospitals</h3>
      
      <div className="custom-location-input">
        <input
          type="text"
          placeholder="Enter address or location name"
          value={customLocation}
          onChange={(e) => setCustomLocation(e.target.value)}
        />
        <button onClick={handleCustomLocation}>Find Nearby Hospitals</button>
      </div>

      {quickLocations.length > 0 && (
        <div className="quick-locations">
          <p>Or select a quick location:</p>
          <div className="location-buttons">
            {quickLocations.map(location => (
              <button 
                key={location.id} 
                onClick={() => handleLocationClick(location.coordinates.lat, location.coordinates.lng, location.name)}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="selected-location-info">
          <h4>Selected Location: {selectedLocation.name}</h4>
          <p>Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
};

// Main component
const DriverDashboard = () => {
  const navigate = useNavigate();
  
  const [driver, setDriver] = useState({
    name: 'Loading...',
    status: 'Available',
    totalRescues: 0,
    todayDistance: '0',
    coordinates: null
  });

  const [activeRequests, setActiveRequests] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [rescueHistory, setRescueHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [quickLocations, setQuickLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [routingTo, setRoutingTo] = useState(null);
  const [routingHospital, setRoutingHospital] = useState(null);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    loadQuickLocations();
    
    // Show emergency alert and sound when driver logs in
    setShowEmergencyAlert(true);
    playEmergencySound();
    
    // Hide emergency alert after 5 seconds
    const timer = setTimeout(() => {
      setShowEmergencyAlert(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await driverService.getDashboard();
      
      if (dashboardData.status === 'success') {
        const { driverInfo, stats, assignedRequests, emergencyRequests, rescueHistory, nearbyHospitals } = dashboardData.data;
        
        setDriver({
          name: driverInfo.name || 'Driver',
          status: driverInfo.status || 'Available',
          totalRescues: stats.totalRescues || 0,
          todayDistance: `${stats.todayDistance || 0}`,
          coordinates: driverInfo.coordinates,
          ...driverInfo
        });

        // Convert backend data to frontend format
        setActiveRequests(assignedRequests.map(req => ({
          id: req._id,
          location: req.location.address,
          coordinates: { lat: req.location.coordinates.lat, lng: req.location.coordinates.lng },
          dog: {
            name: req.dog.name || 'Unknown',
            breed: req.dog.breed || 'Mixed Breed',
            condition: req.dog.condition,
            photo: req.dog.photo || ''
          },
          reporter: {
            name: req.reporter.name,
            phone: req.reporter.phone,
            email: req.reporter.email || ''
          },
          timeReported: req.createdAt,
          status: req.status,
          notes: req.notes || '',
          photos: req.photos || [],
          priority: req.priority
        })));

        setEmergencyRequests(emergencyRequests.map(req => ({
          id: req._id,
          location: req.location.address,
          coordinates: { lat: req.location.coordinates.lat, lng: req.location.coordinates.lng },
          dog: {
            name: req.dog.name || 'Unknown',
            breed: req.dog.breed || 'Mixed Breed',
            condition: req.dog.condition,
            photo: req.dog.photo || ''
          },
          reporter: {
            name: req.reporter.name,
            phone: req.reporter.phone,
            email: req.reporter.email || ''
          },
          timeReported: req.createdAt,
          status: req.status,
          notes: req.notes || '',
          photos: req.photos || [],
          priority: req.priority
        })));

        setRescueHistory(rescueHistory.map(req => ({
          id: req._id,
          date: new Date(req.completedAt || req.createdAt).toISOString().split('T')[0],
          location: req.location.address,
          dogId: `RQ-${Date.now()}`,
          dogName: req.dog.name || 'Unknown',
          status: req.status,
          notes: req.notes || '',
          photos: req.photos || []
        })));

        setNearbyHospitals(nearbyHospitals.map(h => ({
          id: h._id,
          name: h.name,
          coordinates: { lat: h.coordinates.lat, lng: h.coordinates.lng },
          address: h.address,
          phone: h.phone
        })));

        // Add welcome notification
        addNotification('✅ Dashboard loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
      addNotification('❌ Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuickLocations = async () => {
    try {
      const locationsData = await driverService.getQuickLocations();
      if (locationsData.status === 'success') {
        setQuickLocations(locationsData.data);
      }
    } catch (error) {
      console.error('Error loading quick locations:', error);
      // Fallback to empty array if API fails
      setQuickLocations([]);
    }
  };

  // Utility function to add notifications
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowLocationSelector(false);
  };

  // Real-time updates using WebSocket or polling
  useEffect(() => {
    let pollInterval;
    
    const pollForUpdates = async () => {
      try {
        const updates = await driverService.getRealtimeUpdates();
        if (updates.status === 'success') {
          const { newEmergencies, updatedRequests, notifications: newNotifications } = updates.data;
          
          // Handle new emergency requests
          if (newEmergencies && newEmergencies.length > 0) {
            newEmergencies.forEach(emergency => {
              const formattedEmergency = {
                id: emergency._id,
                location: emergency.location.address,
                coordinates: { lat: emergency.location.coordinates.lat, lng: emergency.location.coordinates.lng },
                dog: {
                  name: emergency.dog.name || 'Unknown',
                  breed: emergency.dog.breed || 'Mixed Breed',
                  condition: emergency.dog.condition,
                  photo: emergency.dog.photo || ''
                },
                reporter: {
                  name: emergency.reporter.name,
                  phone: emergency.reporter.phone,
                  email: emergency.reporter.email || ''
                },
                timeReported: emergency.createdAt,
                status: emergency.status,
                notes: emergency.notes || '',
                photos: emergency.photos || [],
                priority: emergency.priority
              };
              
              setEmergencyRequests(prev => [...prev, formattedEmergency]);
              
              addNotification(
                `🚑 EMERGENCY: New critical case at ${formattedEmergency.location} - ${formattedEmergency.dog.name}`,
                'emergency'
              );
              
              // Browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('EMERGENCY ALERT', { 
                  body: `New emergency: ${formattedEmergency.dog.name} at ${formattedEmergency.location}`, 
                  icon: '/logo192.png',
                  tag: 'emergency'
                });
              }
              
              playEmergencySound();
            });
          }
          
          // Handle updated requests
          if (updatedRequests && updatedRequests.length > 0) {
            // Update existing requests with new status
            setActiveRequests(prev => 
              prev.map(req => {
                const update = updatedRequests.find(u => u._id === req.id);
                return update ? { ...req, status: update.status, notes: update.notes } : req;
              })
            );
          }
          
          // Handle new notifications
          if (newNotifications && newNotifications.length > 0) {
            newNotifications.forEach(notification => {
              addNotification(notification.message, notification.type);
            });
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };
    
    // Poll every 30 seconds for updates
    pollInterval = setInterval(pollForUpdates, 30000);
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  // Get current location using geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        position => {
          const newCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setDriver(prev => ({
            ...prev,
            coordinates: newCoordinates
          }));

          // Update location on server
          driverService.updateLocation(newCoordinates).catch(error => {
            console.warn('Failed to update location on server:', error);
          });
        },
        error => {
          console.warn('Geolocation error:', error);
          setGeoDenied(true);
          addNotification('Location access denied. In-app routing needs location permission. Maps will still use your device location if allowed.', 'warning');
          // Do not override coordinates with a default; leave as-is so external maps can use device location
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      addNotification('Geolocation not supported by this browser.', 'warning');
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      if (pendingActions.length > 0) syncPendingActions();
    };
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playEmergencySound = () => {
    // Create emergency alert sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Function to create a single siren sound
      const createSirenSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'siren';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      };
      
      // Play the siren sound repeatedly for 5 seconds
      createSirenSound(); // Play immediately
      
      // Continue playing every 0.6 seconds for 5 seconds
      let repeatCount = 0;
      const maxRepeats = 8; // 0.6 seconds interval * 8 = 4.8 seconds + initial = ~5 seconds
      
      const repeatInterval = setInterval(() => {
        repeatCount++;
        createSirenSound();
        
        if (repeatCount >= maxRepeats) {
          clearInterval(repeatInterval);
        }
      }, 600);
      
    } catch (e) {
      console.log('Web Audio API not supported, using fallback sound');
      // Fallback: Create a simple beep sound using HTML5 Audio
      try {
        const emergencyBeep = () => {
          const context = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          
          gainNode.gain.value = 0.5;
          
          oscillator.start();
          
          setTimeout(() => {
            oscillator.stop();
          }, 500);
        };
        
        // Play beep sound repeatedly for 5 seconds
        emergencyBeep();
        const beepInterval = setInterval(emergencyBeep, 600);
        setTimeout(() => clearInterval(beepInterval), 5000);
        
      } catch (fallbackError) {
        console.log('Fallback audio also not supported');
      }
    }
  };

  const syncPendingActions = () => {
    console.log('Syncing pending actions:', pendingActions);
    setPendingActions([]);
  };

  const updateRescueStatus = async (id, newStatus, isEmergency = false) => {
    try {
      // Update local state optimistically
      const source = isEmergency ? emergencyRequests : activeRequests;
      const setSource = isEmergency ? setEmergencyRequests : setActiveRequests;
      
      const updatedRequests = source.map(req => req.id === id ? { ...req, status: newStatus } : req);
      setSource(updatedRequests);

      // Call API to update status
      if (!offlineMode) {
        await driverService.updateTaskStatus(id, newStatus, null, driver.coordinates);
        addNotification(`✅ Status updated to ${newStatus}`, 'success');
      } else {
        setPendingActions(prev => [...prev, { type: 'UPDATE_STATUS', id, newStatus, timestamp: Date.now() }]);
        addNotification('📱 Status update saved for sync', 'info');
      }

      if (newStatus === 'Rescued') {
        const rescuedRequest = source.find(req => req.id === id);
        const newHistoryItem = {
          id: rescuedRequest.id,
          date: new Date().toISOString().split('T')[0],
          location: rescuedRequest.location,
          dogId: `RQ-${Date.now()}`,
          dogName: rescuedRequest.dog.name,
          status: 'Rescued',
          notes: rescuedRequest.notes || 'Rescued by ' + driver.name,
          photos: rescuedRequest.photos || []
        };
        setRescueHistory(prev => [newHistoryItem, ...prev]);
        setSource(prev => prev.filter(req => req.id !== id));

        addNotification(`✅ Successfully rescued ${rescuedRequest.dog.name} at ${rescuedRequest.location}`, 'success');
      }
    } catch (error) {
      console.error('Error updating rescue status:', error);
      addNotification('❌ Failed to update status', 'error');
      
      // Revert optimistic update
      const source = isEmergency ? emergencyRequests : activeRequests;
      const setSource = isEmergency ? setEmergencyRequests : setActiveRequests;
      const originalRequest = source.find(req => req.id === id);
      if (originalRequest) {
        const revertedRequests = source.map(req => req.id === id ? { ...req, status: originalRequest.status } : req);
        setSource(revertedRequests);
      }
    }
  };

  const startRouting = async (rescue, isEmergency = false) => {
    try {
      // Get current location first
      if (!driver.coordinates) {
        // Try to get current location
        try {
          const position = await getCurrentLocation();
          if (position) {
            const newCoordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setDriver(prev => ({ ...prev, coordinates: newCoordinates }));
          }
        } catch (e) {
          // If denied, don't override with a default; notify and let external Maps handle device location
          addNotification('Could not get current location in app. Opening Maps will still use your device location if permitted.', 'warning');
        }
      }

      setRoutingTo(rescue);
      setRoutingHospital(null);
      
      // Update status to Driver En Route
      await updateRescueStatus(rescue.id, 'Driver En Route', isEmergency);

      // Show detailed navigation notification
      const currentLocation = driver.coordinates 
        ? `${driver.coordinates.lat.toFixed(4)}, ${driver.coordinates.lng.toFixed(4)}`
        : 'Current Location';
      
      const rescueLocation = `${rescue.coordinates.lat.toFixed(4)}, ${rescue.coordinates.lng.toFixed(4)}`;
      
      addNotification(
        `🗺️ Navigating to ${currentLocation} at ${rescue.location} (${rescueLocation})`, 
        'navigation'
      );

      // Optional: Open external navigation app
      if (window.confirm('Would you like to open this location in your maps app?')) {
        const destination = rescue.location && typeof rescue.location === 'string' && rescue.location.trim().length > 0
          ? encodeURIComponent(rescue.location)
          : `${rescue.coordinates.lat},${rescue.coordinates.lng}`;
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(mapsUrl, '_blank');
      }

    } catch (error) {
      console.error('Error starting navigation:', error);
      addNotification('❌ Failed to start navigation', 'error');
    }
  };

  // Helper function to get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // Complete rescue function
  const completeRescue = async (id, isEmergency = false) => {
    try {
      const confirmation = window.confirm(
        'Are you sure you want to mark this rescue as complete? This action cannot be undone.'
      );
      
      if (!confirmation) return;

      // Update status to complete
      await updateRescueStatus(id, 'Rescued', isEmergency);
      
      // Show success notification
      const request = isEmergency 
        ? emergencyRequests.find(req => req.id === id)
        : activeRequests.find(req => req.id === id);
      
      if (request) {
        addNotification(
          `✅ Rescue completed successfully for ${request.dog.name} at ${request.location}`, 
          'success'
        );
      }

      // Refresh dashboard data to update all status displays
      await loadDashboardData();
      
    } catch (error) {
      console.error('Error completing rescue:', error);
      addNotification('❌ Failed to complete rescue', 'error');
    }
  };

  const routeToHospital = async (rescue, hospital) => {
    setRoutingTo(null);
    setRoutingHospital({ rescue, hospital });
    
    try {
      // Update rescue status to indicate en route to hospital
      await driverService.updateTaskStatus(rescue.id, 'En Route to Hospital', `Transporting to ${hospital.name}`, driver.coordinates, hospital.id);
      addNotification(`🏥 Navigating to ${hospital.name} with ${rescue.dog.name}`, 'info');
    } catch (error) {
      console.error('Error updating hospital route:', error);
      addNotification('❌ Failed to update hospital route', 'error');
    }
  };

  const handlePhotoUpload = async (id, event, isEmergency = false) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = e => {
        const photoDataUrl = e.target.result;
        setPhotoData(photoDataUrl);
        
        // Update local state for immediate feedback
        if (isEmergency) {
          const updatedRequests = emergencyRequests.map(req => 
            req.id === id ? { ...req, photos: [...req.photos, photoDataUrl] } : req
          );
          setEmergencyRequests(updatedRequests);
        } else {
          const updatedRequests = activeRequests.map(req => 
            req.id === id ? { ...req, photos: [...req.photos, photoDataUrl] } : req
          );
          setActiveRequests(updatedRequests);
        }
      };
      reader.readAsDataURL(file);

      // Upload to server if online
      if (!offlineMode) {
        await driverService.uploadRescuePhotos(id, [file]);
        addNotification('📸 Photo uploaded successfully', 'success');
      } else {
        setPendingActions(prev => [...prev, { type: 'UPLOAD_PHOTO', id, file, timestamp: Date.now() }]);
        addNotification('📱 Photo saved for sync', 'info');
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      addNotification('❌ Failed to upload photo', 'error');
    }
  };

  const updateNotes = (id, notes, isEmergency = false) => {
    if (isEmergency) {
      const updatedRequests = emergencyRequests.map(req => req.id === id ? { ...req, notes } : req);
      setEmergencyRequests(updatedRequests);
    } else {
      const updatedRequests = activeRequests.map(req => req.id === id ? { ...req, notes } : req);
      setActiveRequests(updatedRequests);
    }
    
    const historyIndex = rescueHistory.findIndex(r => r.id === id + 100);
    if (historyIndex !== -1) {
      const updatedHistory = [...rescueHistory];
      updatedHistory[historyIndex] = { ...updatedHistory[historyIndex], notes };
      setRescueHistory(updatedHistory);
    }
  };

  const generatePDF = async (rescue) => {
    try {
      addNotification(`📄 Generating report for ${rescue.dogName}...`, 'info');
      await driverService.downloadRescueReportPDF(rescue.id);
      addNotification('✅ Report downloaded', 'success');
    } catch (error) {
      console.error('Generate report error:', error);
      addNotification('❌ Failed to generate report PDF', 'error');
    }
  };
  const markNotificationAsRead = id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const toggleDriverStatus = async () => {
    const newStatus = driver.status === 'Available' ? 'On Duty' : 'Available';
    
    try {
      // Update local state optimistically
      setDriver(prev => ({ ...prev, status: newStatus }));
      
      if (!offlineMode) {
        await driverService.updateAvailability(newStatus, driver.coordinates);
        addNotification(`✅ Status updated to ${newStatus}`, 'success');
      } else {
        setPendingActions(prev => [...prev, { type: 'UPDATE_AVAILABILITY', status: newStatus, timestamp: Date.now() }]);
        addNotification('📱 Status change saved for sync', 'info');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      addNotification('❌ Failed to update status', 'error');
      // Revert optimistic update
      setDriver(prev => ({ ...prev, status: driver.status }));
    }
  };
  const formatTime = timeString => new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Navigation functions
  
  const navigateToReports = () => {
    navigate('/myreports');
  };
  
  const pendingRescues = activeRequests.filter(req => req.status === 'Pending Pickup' || req.status === 'Driver En Route').length;
  const pendingEmergencies = emergencyRequests.filter(req => req.status === 'Emergency' || req.status === 'Driver En Route').length;

  // Loading state
  if (loading) {
    return (
      <div className="dr-driver-dashboard loading">
        <div className="dr-loading-container">
          <div className="dr-loading-spinner"></div>
          <h2>Loading Driver Dashboard...</h2>
          <p>Fetching rescue requests and hospital data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dr-driver-dashboard error">
        <div className="dr-error-container">
          <div className="dr-error-icon">⚠️</div>
          <h2>Failed to Load Dashboard</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="dr-retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Default center for map if no driver coordinates
  const mapCenter = driver.coordinates || { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

  return (
    <div className="dr-driver-dashboard">
      {offlineMode && <div className="dr-offline-indicator">⚠️ Offline Mode - Actions will be synced when connection is restored</div>}

      {/* Emergency Alert Modal */}
      {showEmergencyAlert && (
        <div className="dr-emergency-alert-modal">
          <div className="dr-emergency-alert-content">
            <div className="dr-emergency-icon">🚨</div>
            <h2>MISSION STATUS: ACTIVE</h2>
            <p>Be Prepared to Save Lives</p>
            <div className="dr-emergency-alert-timer">System initializing...</div>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <div className="dr-location-selector-modal">
          <div className="dr-modal-content">
            <div className="dr-modal-header">
              <h2>Find Nearby Hospitals</h2>
              <button onClick={() => setShowLocationSelector(false)}>×</button>
            </div>
            <LocationSelector 
              onLocationSelect={handleLocationSelect} 
              nearbyHospitals={nearbyHospitals}
              quickLocations={quickLocations}
            />
          </div>
        </div>
      )}

      {/* Header */}
        <header className="dr-dashboard-header">
          <div className="dr-header-content">
            <div className="dr-logo-section">
          <h1>🚑 Driver Dashboard </h1>
          <p>Track rescues and view nearby hospitals/vets in real-time</p>
            </div>
            <div className="dr-profile-section">
          <div className="dr-driver-info">
            <span className="dr-driver-name">{driver.name}</span>
            <span className={`status-indicator ${driver.status === 'Available' ? 'available' : 'on-duty'}`} onClick={toggleDriverStatus}>
              {driver.status}
            </span>
          </div>
          <div className="dr-profile-avatar">{driver.name.split(' ').map(n => n[0]).join('')}</div>
            </div>
          </div>
          
          <div className="dr-dashboard-navigation">
            
            <button className="dr-nav-button" onClick={navigateToReports}>📊 View My Reports</button>
          </div>
        </header>

        {/* Metrics */}
      <section className="dr-metrics-section">
        <div className="dr-metric-card"><div className="dr-metric-icon">✅</div><div className="dr-metric-info"><h3>{driver.totalRescues}</h3><p>Total Rescues</p></div></div>
        <div className="dr-metric-card"><div className="dr-metric-icon">⏳</div><div className="dr-metric-info"><h3>{pendingRescues}</h3><p>Pending Rescues</p></div></div>
        <div className="dr-metric-card emergency-alert"><div className="dr-metric-icon">🚑</div><div className="dr-metric-info"><h3>{pendingEmergencies}</h3><p>Emergencies</p></div></div>
        <div className="dr-metric-card"><div className="dr-metric-icon">🚗</div><div className="dr-metric-info"><h3>{driver.todayDistance} km</h3><p>Distance Today</p></div></div>
        <div className="dr-metric-card"><div className="dr-metric-icon">{offlineMode ? '🔴' : '🟢'}</div><div className="dr-metric-info"><h3>{offlineMode ? 'Offline' : 'Online'}</h3><p>Connection Status</p></div></div>
      </section>

      <div className="dr-dashboard-content">
        {/* Live Map */}
        <section className="dr-map-section">
          <h2>Live Map - Sri Lanka {routingTo && `(Routing to ${routingTo.dog.name})`} {routingHospital && `(Taking ${routingHospital.rescue.dog.name} to ${routingHospital.hospital.name})`}</h2>
          <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={driver.coordinates ? 12 : 8} 
            style={{ height: '500px', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            
            {driver.coordinates && (
              <Marker position={[driver.coordinates.lat, driver.coordinates.lng]} icon={driverIcon}>
                <Popup>{driver.name} (You)</Popup>
              </Marker>
            )}
            
            {/* Regular Rescue Requests */}
            {activeRequests.map(req => (
              <Marker key={req.id} position={[req.coordinates.lat, req.coordinates.lng]} icon={rescueIcon}>
                <Popup>
                  <strong>{req.dog.name}</strong><br />
                  {req.dog.condition}<br />
                  {req.location}<br />
                  <button onClick={() => startRouting(req, false)}>🐾 Go to Pet Location</button>
                  <div>🏥 Nearest Hospital: {findNearestHospital(req.coordinates, nearbyHospitals)?.name || 'N/A'}</div>
                </Popup>
              </Marker>
            ))}
            
            {/* Emergency Requests */}
            {emergencyRequests.map(req => (
              <Marker key={req.id} position={[req.coordinates.lat, req.coordinates.lng]} icon={emergencyIcon}>
                <Popup>
                  <strong>🚨 EMERGENCY: {req.dog.name}</strong><br />
                  {req.dog.condition}<br />
                  {req.location}<br />
                  <button onClick={() => startRouting(req, true)}>🚑 Go to Emergency</button>
                  <div>🏥 Nearest Hospital: {findNearestHospital(req.coordinates, nearbyHospitals)?.name || 'N/A'}</div>
                </Popup>
              </Marker>
            ))}
            
            {/* Hospitals */}
            {nearbyHospitals.map(h => (
              <Marker key={h.id} position={[h.coordinates.lat, h.coordinates.lng]} icon={hospitalIcon}>
                <Popup>
                  <strong>{h.name}</strong><br />
                  {h.address}<br />
                  {h.phone}
                </Popup>
              </Marker>
            ))}
            
            {/* Selected Location Marker */}
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={locationIcon}>
                <Popup>
                  <strong>Selected Location: {selectedLocation.name}</strong><br />
                  <div className="dr-nearby-hospitals-list">
                    <h4>Nearby Hospitals:</h4>
                    {nearbyHospitals
                      .map(h => ({...h, distance: getDistance(selectedLocation, h.coordinates)}))
                      .sort((a, b) => a.distance - b.distance)
                      .slice(0, 5)
                      .map(h => (
                        <div key={h.id} className="dr-hospital-info">
                          <strong>{h.name}</strong> - {h.distance.toFixed(1)} km<br />
                          {h.address}<br />
                          📞 {h.phone}
                        </div>
                      ))
                    }
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Routing to rescue */}
            {routingTo && routingTo.coordinates && driver.coordinates && (
              <Routing 
                key={`rescue-${routingTo.id || 'default'}`}
                driverPosition={driver.coordinates} 
                destination={routingTo.coordinates} 
                color="#0066cc" 
              />
            )}
            
            {/* Routing to hospital */}
            {routingHospital && routingHospital.hospital && routingHospital.hospital.coordinates && driver.coordinates && (
              <Routing 
                key={`hospital-${routingHospital.hospital.id || 'default'}`}
                driverPosition={driver.coordinates} 
                destination={routingHospital.hospital.coordinates} 
                color="#cc0000" 
              />
            )}
          </MapContainer>

          <button className="dr-btn-find-hospitals" onClick={() => setShowLocationSelector(true)}>
            🏥 Find Hospitals Near Location
          </button>
        </section>

        {/* Notifications */}
        <section className="dr-notifications-section">
          <h2>Notifications 🔔</h2>
          <div className="dr-notifications-list">
            {notifications.map(n => (
              <div key={n.id} className={`dr-notification ${n.read ? 'read' : 'unread'} ${n.type}`} onClick={() => markNotificationAsRead(n.id)}>
                <p>{n.message}</p>
                <span className="dr-notification-time">{n.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Requests Panel */}
        {emergencyRequests.length > 0 && (
          <section className="dr-emergency-requests-section">
            <div className="dr-section-header">
              <h2>🚑 Emergency Requests {showEmergencyPanel ? '▼' : '▲'}</h2>
              <button onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}>
                {showEmergencyPanel ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showEmergencyPanel && (
              <div className="dr-emergency-list">
                {emergencyRequests.map(req => (
                  <div key={req.id} className="dr-request-card emergency">
                    <div className="dr-emergency-banner">🚨 EMERGENCY</div>
                    <h3>{req.dog.name} - {req.dog.breed}</h3>
                    <p className="dr-emergency-condition">{req.dog.condition}</p>
                    <p>Location: {req.location}</p>
                    <p>Reported at: {formatTime(req.timeReported)}</p>
                    <p>Status: <strong>{req.status}</strong></p>
                    <p>Reporter: {req.reporter.name} ({req.reporter.phone})</p>
                    
                    <div className="dr-request-actions">
                      <button onClick={() => startRouting(req, true)}>🚑 Go to Emergency</button>
                      {req.status === 'Driver En Route' && (
                        <button onClick={() => updateRescueStatus(req.id, 'Dog Picked Up', true)} className="dr-status-button">
                          🐕 Mark as Picked Up
                        </button>
                      )}
                      {(req.status === 'Dog Picked Up' || req.status === 'En Route to Hospital' || req.status === 'At Hospital') && (
                        <button onClick={() => completeRescue(req.id, true)} className="dr-complete-button">
                          ✅ Complete Rescue
                        </button>
                      )}
                      {req.status === 'On the Way' && (
                        <>
                          <button onClick={() => updateRescueStatus(req.id, 'Rescued', true)}>✅ Mark as Rescued</button>
                          {driver.coordinates && (
                            <div className="dr-hospital-suggestions">
                              <h4>🏥 Nearest Hospitals:</h4>
                              {nearbyHospitals
                                .map(h => ({...h, distance: getDistance(req.coordinates, h.coordinates)}))
                                .sort((a, b) => a.distance - b.distance)
                                .slice(0, 3)
                                .map(h => (
                                  <div key={h.id} className="dr-hospital-option">
                                    <span>{h.name} ({h.distance.toFixed(1)} km)</span>
                                    <button onClick={() => routeToHospital(req, h)}>Navigate</button>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </>
                      )}
                      <button onClick={() => setShowPhotoUpload(showPhotoUpload === `emergency-${req.id}` ? null : `emergency-${req.id}`)}>📸 Add Photos</button>
                      <button onClick={() => { const notes = prompt('Add notes:', req.notes || ''); if (notes !== null) updateNotes(req.id, notes, true); }}>📝 Add Notes</button>
                    </div>

                    {showPhotoUpload === `emergency-${req.id}` && (
                      <div className="dr-photo-upload">
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(req.id, e, true)} capture="environment" />
                        {req.photos.length > 0 && (
                          <div className="dr-photo-preview">{req.photos.map((photo, i) => <img key={i} src={photo} alt={`Emergency ${i+1}`} />)}</div>
                        )}
                      </div>
                    )}

                    {req.notes && <div className="dr-rescue-notes"><strong>Notes:</strong> {req.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Active Rescue Requests */}
        <section className="dr-active-requests-section">
          <h2>Active Rescue Requests 🚦</h2>
          {activeRequests.length === 0 ? <p>No active rescue requests.</p> : activeRequests.map(req => (
            <div key={req.id} className="dr-request-card">
              <h3>{req.dog.name} - {req.dog.breed}</h3>
              <p>{req.dog.condition}</p>
              <p>Location: {req.location}</p>
              <p>Reported at: {formatTime(req.timeReported)}</p>
              <p>Status: <strong>{req.status}</strong></p>
              <p>Reporter: {req.reporter.name} ({req.reporter.phone})</p>
              
              <div className="dr-request-actions">
                <button onClick={() => startRouting(req, false)}>🐾 Go to Pet Location</button>
                {req.status === 'Driver En Route' && (
                  <button onClick={() => updateRescueStatus(req.id, 'Dog Picked Up', false)} className="dr-status-button">
                    🐕 Mark as Picked Up
                  </button>
                )}
                {(req.status === 'Dog Picked Up' || req.status === 'En Route to Hospital' || req.status === 'At Hospital') && (
                  <button onClick={() => completeRescue(req.id, false)} className="dr-complete-button">
                    ✅ Complete Rescue
                  </button>
                )}
                {req.status === 'On the Way' && (
                  <>
                    <button onClick={() => updateRescueStatus(req.id, 'Rescued', false)}>✅ Mark as Rescued</button>
                    {driver.coordinates && (
                      <div className="dr-hospital-suggestions">
                        <h4>🏥 Nearest Hospitals:</h4>
                        {nearbyHospitals
                          .map(h => ({...h, distance: getDistance(req.coordinates, h.coordinates)}))
                          .sort((a, b) => a.distance - b.distance)
                          .slice(0, 2)
                          .map(h => (
                            <div key={h.id} className="dr-hospital-option">
                              <span>{h.name} ({h.distance.toFixed(1)} km)</span>
                              <button onClick={() => routeToHospital(req, h)}>Navigate</button>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </>
                )}
                <button onClick={() => setShowPhotoUpload(showPhotoUpload === req.id ? null : req.id)}>📸 Add Photos</button>
                <button onClick={() => { const notes = prompt('Add notes:', req.notes || ''); if (notes !== null) updateNotes(req.id, notes, false); }}>📝 Add Notes</button>
              </div>

              {showPhotoUpload === req.id && (
                <div className="dr-photo-upload">
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(req.id, e, false)} capture="environment" />
                  {req.photos.length > 0 && (
                    <div className="dr-photo-preview">{req.photos.map((photo, i) => <img key={i} src={photo} alt={`Rescue ${i+1}`} />)}</div>
                  )}
                </div>
              )}

              {req.notes && <div className="dr-rescue-notes"><strong>Notes:</strong> {req.notes}</div>}
            </div>
          ))}
        </section>

        {/* Rescue History */}
        <section className="dr-rescue-history-section">
          <h2>Rescue History 📊</h2>
          <div className="dr-history-actions">
            <button onClick={async () => {
              try {
                addNotification('📊 Generating full history report...', 'info');
                await driverService.downloadFullHistoryPDF('all');
                addNotification('✅ Full report downloaded', 'success');
              } catch (e) {
                console.error(e);
                addNotification('❌ Failed to generate full report', 'error');
              }
            }}>📄 Generate Full Report</button>
          </div>
          <table className="dr-history-table">
            <thead>
              <tr><th>Date</th><th>Location</th><th>Dog ID</th><th>Dog Name</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rescueHistory.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.location}</td>
                  <td>{r.dogId}</td>
                  <td>{r.dogName}</td>
                  <td>{r.status}</td>
                  <td>{r.notes}</td>
                  <td><button onClick={() => generatePDF(r)}>📋 Report</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="dr-action-buttons">
        <button className="dr-btn-refresh" onClick={loadDashboardData} disabled={loading}>
          🔄 {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
        <button className="dr-btn-logout" onClick={() => navigate('/login')}>🚪 Logout</button>
        {offlineMode && <button className="dr-btn-sync" onClick={syncPendingActions}>🔄 Sync Pending Actions ({pendingActions.length})</button>}
      </div>
    </div>
  );
};

export default DriverDashboard;