const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  station_id: String,
  station_name: String,
  latitude: Number,
  longitude: Number,
  transport_type: String
});

const Station = mongoose.model('Station', stationSchema, 'Station');

module.exports = Station;
