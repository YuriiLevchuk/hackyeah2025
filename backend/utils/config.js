require('dotenv').config();

MONGODB_URI = process.env.MONGODB_URI
PORT = process.env.PORT || 3003

module.exports = { PORT, MONGODB_URI }