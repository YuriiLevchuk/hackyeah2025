const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: String,
  first_name: String,
  last_name: String,
  email: String,
  password_hash: String
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const User = mongoose.model('User', userSchema, 'User');

module.exports = User;
