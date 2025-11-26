const Routing = ({ driverPosition, destination, color = '#0066cc' }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!driverPosition || !destination || !map) return;

    const timeout = setTimeout(() => {
      // Remove existing routing safely
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Add new routing
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
        createMarker: () => null
      }).addTo(map);
    }, 100); // 100ms delay ensures map is ready

    return () => {
      clearTimeout(timeout);
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [driverPosition, destination, map, color]);

  return null;
};
