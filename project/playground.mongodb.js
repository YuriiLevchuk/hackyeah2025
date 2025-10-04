// Switch to (or create) a database
use('TransportDelayDB');

db.User.InsertOne({
  user_id: "u001",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  password_hash: "$2b$10$...",
  created_at: new Date(),
  updated_at: new Date()
})

db.Station.InsertOne({
  station_id: "s001",
  station_name: "TestStation",
  city: "Wasrzawa",
  address: "Ul. testowa 1",
  latitude: 40.7128,
  longitude: -74.0060,
  transport_type: "Train"
})

db.Transport.InsertOne({
  transport_id: "t001",
  transport_type: "Train",
  stop_list: ["Station A", "Station B", "Station C"]
})

