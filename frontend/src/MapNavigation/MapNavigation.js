import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Routing component
const RoutingMachine = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // Remove existing route
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Add new route
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: (i, wp) => L.marker(wp.latLng)
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [start, end, map]);

  return null;
};

const MapNavigation = ({ driverLocation, destination }) => {
  return (
    <MapContainer
      center={[driverLocation.lat, driverLocation.lng]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Driver marker */}
      <Marker position={[driverLocation.lat, driverLocation.lng]}>
        <L.Popup>Driver Location</L.Popup>
      </Marker>

      {/* Destination marker */}
      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <L.Popup>Destination</L.Popup>
        </Marker>
      )}

      {/* Routing between driver and destination */}
      {destination && <RoutingMachine start={driverLocation} end={destination} />}
    </MapContainer>
  );
};

export default MapNavigation;
