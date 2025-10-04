const stationRouter = require('express').Router()
const Station = require('../models/station')

stationRouter.get('/', async (req, res) => {
  const stations = await Station
    .find({})
  res.json(stations)
})

stationRouter.get('/:id', async (req, res) => {
  const station = await Station
    .findById(req.params.id)
  res.json(station)
})

stationRouter.post('/', async (req, res) => {
  const { station_id, station_name, latitude, longitude, transport_type } = req.body

  const station = new Station({
    station_id,
    station_name,
    latitude,
    longitude,
    transport_type
  })

  const savedStation = await station.save()
  res.json(savedStation)
})

module.exports = stationRouter
