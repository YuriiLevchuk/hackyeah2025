const express = require('express');
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");
const Station = require('../models/station'); // Adjust path as needed

const router = express.Router();

// Helper function to fetch GTFS data
async function fetchGTFSData(url) {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

router.get("/", async (req, res) => {
  try {
    // Prevent client caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Fetch stations, vehicle positions, and trip updates in parallel
    const [stations, positionsResponse, tripsResponse] = await Promise.allSettled([
      Station.find({}),
      fetchGTFSData("https://gtfs.ztp.krakow.pl/VehiclePositions.pb"),
      fetchGTFSData("https://gtfs.ztp.krakow.pl/TripUpdates.pb")
    ]);

    // Handle responses
    if (positionsResponse.status === 'rejected') {
      throw new Error(`Failed to fetch VehiclePositions: ${positionsResponse.reason}`);
    }

    const positionsFeed = positionsResponse.value;
    const tripsFeed = tripsResponse.status === 'fulfilled' ? tripsResponse.value : null;
    const stationsData = stations.status === 'fulfilled' ? stations.value : [];

    // Create a map of trip updates for easy lookup
    const tripUpdatesMap = new Map();
    if (tripsFeed) {
      tripsFeed.entity.forEach(entity => {
        if (entity.tripUpdate && entity.tripUpdate.trip && entity.tripUpdate.trip.tripId) {
          tripUpdatesMap.set(entity.tripUpdate.trip.tripId, entity.tripUpdate);
        }
      });
    }

    // Create stations lookup map by station_id
    const stationsMap = new Map();
    stationsData.forEach(station => {
      stationsMap.set(station.station_id, station);
    });

    // Process vehicle data with trip updates and station information
    const vehicles = positionsFeed.entity
      .filter((e) => e.vehicle && e.vehicle.position)
      .map((e) => {
        const vehicle = e.vehicle;
        const tripId = vehicle.trip?.tripId;
        const tripUpdate = tripId ? tripUpdatesMap.get(tripId) : null;
        
        const vehicleData = {
          id: e.id,
          vehicleId: vehicle.vehicle?.id || 'unknown',
          tripId: tripId || 'unknown',
          routeId: vehicle.trip?.routeId || 'unknown',
          lat: vehicle.position.latitude,
          lon: vehicle.position.longitude,
          bearing: vehicle.position.bearing || null,
          speed: vehicle.position.speed || null,
          occupancy: vehicle.occupancyStatus,
          timestamp: vehicle.timestamp,
          // Trip update information
          tripUpdate: tripUpdate ? {
            delay: tripUpdate.delay,
            stopTimeUpdates: tripUpdate.stopTimeUpdate ? tripUpdate.stopTimeUpdate.map(stop => {
              const stationInfo = stationsMap.get(stop.stopId);
              return {
                stopId: stop.stopId,
                station: stationInfo ? {
                  id: stationInfo._id,
                  station_id: stationInfo.station_id,
                  station_name: stationInfo.station_name,
                  latitude: stationInfo.latitude,
                  longitude: stationInfo.longitude,
                  transport_type: stationInfo.transport_type
                } : null,
                arrival: stop.arrival ? {
                  time: stop.arrival.time,
                  delay: stop.arrival.delay,
                  uncertainty: stop.arrival.uncertainty
                } : null,
                departure: stop.departure ? {
                  time: stop.departure.time,
                  delay: stop.departure.delay,
                  uncertainty: stop.departure.uncertainty
                } : null
              };
            }) : []
          } : null,
          // Find nearest station
          nearestStation: findNearestStation(vehicle.position.latitude, vehicle.position.longitude, stationsData),
          // Add current server time for reference
          serverTime: Math.floor(Date.now() / 1000)
        };

        return vehicleData;
      });

    console.log(`Data fetched at: ${new Date().toISOString()}, Vehicles: ${vehicles.length}, Stations: ${stationsData.length}, TripUpdates available: ${tripsFeed ? 'Yes' : 'No'}`);
    
    if (tripsResponse.status === 'rejected') {
      console.warn('TripUpdates fetch failed:', tripsResponse.reason);
    }
    if (stations.status === 'rejected') {
      console.warn('Stations fetch failed:', stations.reason);
    }

    res.json({
      vehicles,
      metadata: {
        timestamp: Math.floor(Date.now() / 1000),
        totalVehicles: vehicles.length,
        totalStations: stationsData.length,
        tripUpdatesAvailable: !!tripsFeed,
        tripUpdatesCount: tripsFeed ? tripsFeed.entity.length : 0
      }
    });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch vehicle positions",
      details: error.message 
    });
  }
});

// Helper function to find nearest station for a vehicle
function findNearestStation(vehicleLat, vehicleLon, stations) {
  if (!stations || stations.length === 0) return null;

  let nearestStation = null;
  let minDistance = Infinity;

  stations.forEach(station => {
    const distance = calculateDistance(vehicleLat, vehicleLon, station.latitude, station.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = {
        id: station._id,
        station_id: station.station_id,
        station_name: station.station_name,
        latitude: station.latitude,
        longitude: station.longitude,
        transport_type: station.transport_type,
        distance: distance * 1000, // Convert to meters
        distanceKm: distance // Keep in kilometers
      };
    }
  });

  return nearestStation;
}

module.exports = router;