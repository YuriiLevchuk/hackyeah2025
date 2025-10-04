const express = require('express');
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Prevent client caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const response = await fetch("https://gtfs.ztp.krakow.pl/VehiclePositions.pb", {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const vehicles = feed.entity
      .filter((e) => e.vehicle && e.vehicle.position)
      .map((e) => ({
        id: e.id,
        routeId: e.vehicle.trip?.routeId || 'unknown',
        lat: e.vehicle.position.latitude,
        lon: e.vehicle.position.longitude,
        occupancy: e.vehicle.occupancyStatus,
        timestamp: e.vehicle.timestamp,
        // Add current server time for reference
        serverTime: Math.floor(Date.now() / 1000)
      }));

    console.log(`Data fetched at: ${new Date().toISOString()}, Vehicles: ${vehicles.length}`);
    res.json(vehicles);
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch vehicle positions" });
  }
});

module.exports = router;