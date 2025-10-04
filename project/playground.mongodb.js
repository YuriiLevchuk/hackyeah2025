// Switch to (or create) a database
use('TransportDelayDB');

// db.User.insertOne({
//   user_id: "u001",  
//   first_name: "John",
//   last_name: "Doe",
//   email: "john.doe@example.com",
//   password_hash: "$2b$10$...",
//   created_at: new Date(),
//   updated_at: new Date()
// })

// db.Station.insertOne({
//   station_id: "s001",
//   station_name: "TestStation",
//   city: "Wasrzawa",
//   address: "Ul. testowa 1",
//   latitude: 40.7128,
//   longitude: -74.0060,
//   transport_type: "Train"
// })

// db.Transport.insertOne({
//   transport_id: "t001",
//   transport_type: "Train",
//   stop_list: ["Station A", "Station B", "Station C"]
// })

db.Event.insertOne({
  event_id: "e001", // optional human-readable ID
  type: "train_failure", // e.g., "traffic_jam", "accident", "delay"
  reported_at: new Date(), // when first reported
  latitude: 21.0122,
  longtitude: 52.2297,
  severity: "high", // "low", "medium", "high"
  confirmed_count: 1,
  status: "new", // "new", "confirmed", "resolved"
  resolved_at: null, // set when resolved
  duration_minutes: null, // calculated later
  description: "Awaría taboru na linii SKM S1",
  affected_routes: ["S1"], // array of route IDs
  source: "system", // "user", "operator", "system"
  created_at: new Date(),
  updated_at: new Date()
});

