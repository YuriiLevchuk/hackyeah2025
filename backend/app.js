const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const app = express()

// // connect to mongodb //
console.log(config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then( () => logger.info('Connected to mongodb\n---------'))
  .catch( () => logger.info('Connection to mongodb failed\n---------'))

// // middleware //
app.use(cors())

module.exports = app