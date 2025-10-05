import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import useStops from "../../Hooks/useStops";
import useVehicles from "../../Hooks/useVehicles";

// Constants
const MAP_BOUNDS = new LatLngBounds(
  [50.158, 19.699],
  [49.954, 20.277]
);
const MAP_CENTER = [50.066, 19.985];
const INITIAL_ZOOM = 13;
const BASE_ICON_SIZE = 30;
const MAX_MARKERS = 100;
const MIN_ZOOM_FOR_ALL_MARKERS = 14;

// Add CSS transition for markers
const markerStyle = document.createElement("style");
markerStyle.innerHTML = `
  .animated-marker {
    transition: transform s linear;
  }
`;
document.head.appendChild(markerStyle);

const MapController = ({ onBoundsChange, onZoomChange }) => {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
      onZoomChange(map.getZoom());
    },
    zoom: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
};

// Memoized Vehicle Marker Component
const VehicleMarker = React.memo(({ vehicle }) => {
  const markerRef = useRef();
  
  useEffect(() => {
    // Update marker position when vehicle data changes
    if (markerRef.current) {
      markerRef.current.setLatLng([vehicle.lat, vehicle.lon]);
    }
  }, [vehicle.lat, vehicle.lon]);

  return (
    <Marker
      ref={markerRef}
      position={[vehicle.lat, vehicle.lon]}
      icon={L.divIcon({
        html: `<img src="/icons/markers/dot.svg" width="24" height="24" />`,
        className: "animated-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })}
    >
      <Popup>
        <strong>{vehicle.routeId}</strong><br/>
        <small>ID: {vehicle.id}</small>
      </Popup>
    </Marker>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if position or key data changes
  return (
    prevProps.vehicle.lat === nextProps.vehicle.lat &&
    prevProps.vehicle.lon === nextProps.vehicle.lon &&
    prevProps.vehicle.routeId === nextProps.vehicle.routeId &&
    prevProps.vehicle.id === nextProps.vehicle.id
  );
});

const MapComponent = () => {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [bounds, setBounds] = useState(null);
  const { stops, loading, error } = useStops();
  const { vehicles } = useVehicles();

  // Memoized icon creation function
  const getIcon = useCallback((currentZoom) => {
    const size = Math.max(8, BASE_ICON_SIZE * (currentZoom / INITIAL_ZOOM));
    
    return L.divIcon({
      html: `
        <img 
          src="/icons/markers/bus-stop.svg" 
          style="width:${size}px;height:${size}px;" 
          alt="bus stop"
        />
      `,
      className: "bus-stop-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  const visibleStations = useMemo(() => {
    if (!stops || !bounds) return [];
    const inBounds = stops.filter(stop => bounds.contains([stop.latitude, stop.longitude]));
    if (inBounds.length > MAX_MARKERS && zoom < MIN_ZOOM_FOR_ALL_MARKERS) {
      return inBounds.slice(0, MAX_MARKERS);
    }
    return inBounds;
  }, [stops, bounds, zoom]);

  // Filter vehicles within bounds
  const visibleVehicles = useMemo(() => {
    if (!vehicles || !bounds) return [];
    return vehicles.filter(vehicle => 
      vehicle && vehicle.lat && vehicle.lon && bounds.contains([vehicle.lat, vehicle.lon])
    );
  }, [vehicles, bounds]);

  const isLimited = useMemo(() => {
    if (!stops || !bounds) return false;
    const inBounds = stops.filter(stop => bounds.contains([stop.latitude, stop.longitude]));
    return inBounds.length > MAX_MARKERS && zoom < MIN_ZOOM_FOR_ALL_MARKERS;
  }, [stops, bounds, zoom]);

  const stats = useMemo(() => {
    if (!stops || !bounds) return null;
    const totalInBounds = stops.filter(stop => bounds.contains([stop.latitude, stop.longitude])).length;
    return {
      total: stops.length,
      inViewport: totalInBounds,
      showing: visibleStations.length,
      isLimited,
      vehicles: visibleVehicles.length
    };
  }, [stops, bounds, visibleStations.length, isLimited, visibleVehicles.length]);

  if (error) return <div style={{ color: "red" }}>Error loading map: {error}</div>;
  if (loading) return <div>Loading map...</div>;

  return (
    <>
      {stats && (
        <div style={{
          position: "absolute",
          top: "70px",
          right: "10px",
          background: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          zIndex: 1000,
          fontSize: "12px",
          border: "1px solid #ccc"
        }}>
          <div>Total: {stats.total}</div>
          <div>In view: {stats.inViewport}</div>
          <div>Showing: {stats.showing}</div>
          <div>Vehicles: {stats.vehicles}</div>
          {stats.isLimited && <div>Zoom in to see all stops</div>}
        </div>
      )}

      <MapContainer
        center={MAP_CENTER}
        zoom={zoom}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={10}
        maxZoom={18}
        zoomControl={true}
        preferCanvas={true}
      >
        <MapController onBoundsChange={setBounds} onZoomChange={setZoom} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {visibleStations.map(stop => (
          <Marker
            key={stop.station_id}
            position={[stop.latitude, stop.longitude]}
            icon={getIcon(zoom)}
          >
            <Popup>
              <strong>{stop.station_name}</strong><br/>
              <small>ID: {stop.station_id}</small>
            </Popup>
          </Marker>
        ))}

        {visibleVehicles.map(vehicle => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
          />
        ))}
      </MapContainer>
    </>
  );
};

export default React.memo(MapComponent);