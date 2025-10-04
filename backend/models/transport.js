const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  transport_id: String,
  transport_type: String,
  stop_list: [String],
});

transportSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Transport = mongoose.model('Transport', transportSchema, 'Transport');

module.exports = Transport