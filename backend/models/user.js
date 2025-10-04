const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: String,
  first_name: String,
  last_name: String,
  email: String,
  password_hash: String,
  created_at: Date,
  updated_at: Date,
});

const User = mongoose.model('Event', userSchema, 'Event');

module.exports = User;
