import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Constants
const MAP_BOUNDS = new LatLngBounds(
  [50.024, 19.872],
  [50.108, 20.099]
);
const MAP_CENTER = [50.066, 19.985];
const INITIAL_ZOOM = 13;
const BASE_ICON_SIZE = 30;
const MAX_MARKERS = 100;
const MIN_ZOOM_FOR_ALL_MARKERS = 14;

// Custom hook for API calls
const useStops = () => {
  const [stops, setStops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3003/api/station");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStops(data);
      } catch (err) {
        console.error("Failed to fetch stations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  return { stops, loading, error };
};

// Component to handle map events and bounds
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

  // Initial bounds
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
};

const MapComponent = () => {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [bounds, setBounds] = useState(null);
  const { stops, loading, error } = useStops();

  // Memoized icon creation function
  const getIcon = useCallback((currentZoom) => {
    const size = Math.max(8, BASE_ICON_SIZE * (currentZoom / INITIAL_ZOOM));
    
    return L.divIcon({
      html: `
        <img 
          src="/icons/markers/bus-stop.svg" 
          style="
            width:${size}px;
            height:${size}px;
          " 
          alt="bus stop"
        />
      `,
      className: "bus-stop-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  // Filter and limit markers
  const visibleMarkers = useMemo(() => {
    if (!stops || !bounds) return [];
    
    // Filter stops within bounds
    const inBounds = stops.filter(stop => 
      bounds.contains([stop.latitude, stop.longitude])
    );

    // If we have too many markers and zoom is too low, limit the count
    if (inBounds.length > MAX_MARKERS && zoom < MIN_ZOOM_FOR_ALL_MARKERS) {
      // Take first MAX_MARKERS stops (you could implement smarter sampling)
      return inBounds.slice(0, MAX_MARKERS);
    }

    return inBounds;
  }, [stops, bounds, zoom]);

  // Check if markers are being limited
  const isLimited = useMemo(() => {
    if (!stops || !bounds) return false;
    const inBounds = stops.filter(stop => 
      bounds.contains([stop.latitude, stop.longitude])
    );
    return inBounds.length > MAX_MARKERS && zoom < MIN_ZOOM_FOR_ALL_MARKERS;
  }, [stops, bounds, zoom]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!stops || !bounds) return null;
    
    const totalInBounds = stops.filter(stop => 
      bounds.contains([stop.latitude, stop.longitude])
    ).length;

    return {
      total: stops.length,
      inViewport: totalInBounds,
      showing: visibleMarkers.length,
      isLimited: isLimited
    };
  }, [stops, bounds, visibleMarkers.length, isLimited]);

  if (error) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "red"
      }}>
        Error loading map: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        Loading map...
      </div>
    );
  }

  return (
    <>
      {/* Stats overlay */}
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
          {stats.isLimited && (
            <div>
              Zoom in to see all stops
            </div>
          )}
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
        <MapController 
          onBoundsChange={setBounds} 
          onZoomChange={setZoom} 
        />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {visibleMarkers.map((stop) => (
          <Marker
            key={stop.station_id}
            position={[stop.latitude, stop.longitude]}
            icon={getIcon(zoom)}
          >
            <Popup>
              <div>
                <strong>{stop.station_name}</strong>
                <br />
                <small>ID: {stop.station_id}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default React.memo(MapComponent);