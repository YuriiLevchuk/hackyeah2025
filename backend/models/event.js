const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  event_id: String,
  event_type: String,
  timestamp: Date,
  transport_id: String,
  station_id: String,
  delay: Number,
});

const Event = mongoose.model('Event', eventSchema, 'Event');

module.exports = Event;
