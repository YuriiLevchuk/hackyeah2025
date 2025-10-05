// server/routes/vehicles.js

const fs = require("fs");
const { parse } = require("csv-parse/sync");
const express = require("express");
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

const STATIC_GTFS_DIR = "./data"; // adjust to your dataset

const trip_to_route = {};
const route_to_line = {};

// Helper to load CSV into memory
function loadCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return parse(content, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`❌ ${filePath} not found!`);
      process.exit(1);
    } else {
      throw err;
    }
  }
}

// Load trips.txt
for (const row of loadCSV(`${STATIC_GTFS_DIR}/trips.txt`)) {
  trip_to_route[row.trip_id] = row.route_id;
}

// Load routes.txt
for (const row of loadCSV(`${STATIC_GTFS_DIR}/routes.txt`)) {
  route_to_line[row.route_id] = row.route_short_name;
}

// Function to map trip/route → line number
function getLineNumber(trip_id, route_id) {
  // Direct route lookup
  if (route_id && route_to_line[route_id]) {
    return route_to_line[route_id];
  }

  // Try to extract number from trip_id (like Kraków bus lines)
  if (trip_id) {
    const numbers = trip_id.match(/\b(1[0-9]{2}|[2-9][0-9]|[2-9])\b/);
    if (numbers) {
      return numbers[0];
    }
  }

  // Fallback: look for partial trip_id matches
  for (const static_trip in trip_to_route) {
    if (trip_id.includes(static_trip) || static_trip.includes(trip_id)) {
      const rid = trip_to_route[static_trip];
      if (route_to_line[rid]) {
        return route_to_line[rid];
      }
    }
  }

  return "Unknown";
}

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Prevent client caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Fetch GTFS-RT vehicle positions
    const response = await fetch("https://gtfs.ztp.krakow.pl/VehiclePositions_A.pb", {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
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
      .map((e) => {
        // Support both snake_case and camelCase
        const tripId = e.vehicle.trip?.trip_id || e.vehicle.trip?.tripId || "";
        const routeId = e.vehicle.trip?.route_id || e.vehicle.trip?.routeId || "";

        return {
          id: getLineNumber(tripId, routeId),
          routeId: routeId || "unknown",
          lat: e.vehicle.position.latitude,
          lon: e.vehicle.position.longitude,
          occupancy: e.vehicle.occupancyStatus,
          timestamp: e.vehicle.timestamp,
          serverTime: Math.floor(Date.now() / 1000)
        };
      });

    console.log(
      `Data fetched at: ${new Date().toISOString()}, Vehicles: ${vehicles.length}`
    );
    res.json(vehicles);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch vehicle positions" });
  }
});

module.exports = router;
