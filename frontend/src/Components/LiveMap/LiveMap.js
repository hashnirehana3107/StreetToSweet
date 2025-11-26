import React, { useEffect, useRef } from 'react';
import './LiveMap.css';

const LiveMap = ({ reports = [], center = { lat: 40.7128, lng: -74.0060 } }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 12,
    });

    // Add markers for reports
    reports.forEach(report => {
      if (report.location) {
        new window.google.maps.Marker({
          position: { lat: report.location.lat, lng: report.location.lng },
          map: mapInstance.current,
          title: report.description || 'Rescue Report',
          icon: {
            url: getMarkerIcon(report.status),
            scaledSize: new window.google.maps.Size(30, 30)
          }
        });
      }
    });
  }, [reports, center]);

  const getMarkerIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'assigned':
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'completed':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  return (
    <div className="live-map-container">
      <div ref={mapRef} className="live-map" />
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker red"></span>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker yellow"></span>
          <span>Assigned</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker green"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;