const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const transportRouter = require('./controllers/transport')

const app = express()

// // connect to mongodb //
//console.log(config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then( () => logger.info('Connected to mongodb\n---------'))
  .catch( () => logger.info('Connection to mongodb failed\n---------'))

// // middleware //
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.use('/api/transport', transportRouter)
app.use(middleware.unknownEndpoint)

module.exports = app