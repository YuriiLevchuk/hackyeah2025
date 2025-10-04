const express = require('express');
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://gtfs.ztp.krakow.pl/VehiclePositions.pb");
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      return res.status(502).json({ error: "Empty response from server" });
    }

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const vehicles = feed.entity
      .filter((e) => e.vehicle?.position)
      .map((e) => ({
        id: e.id,
        routeId: e.vehicle.trip?.routeId || 'unknown',
        lat: e.vehicle.position.latitude,
        lon: e.vehicle.position.longitude,
        occupancy: e.vehicle.occupancyStatus,
        timestamp: e.vehicle.timestamp,
      }));

    res.json(vehicles);
    
  } catch (error) {
    console.error("GTFS-RT Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch vehicle positions",
      details: error.message 
    });
  }
});

module.exports = router;