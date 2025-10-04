const express = require('express')
const router = express.Router()
const Event = require('../models/event')

router.get('/', async (req, res) => {
  const events = await Event
    .find({})
  res.json(events)
})

router.get('/:id', async (req, res) => {
  const event = await Event
    .findById(req.params.id)
  console.log(event)
  res.json(event)
})

router.post('/', async (req, res) => {
  const { event_id, event_type, timestamp, transport_id, station_id, delay } = req.body

  const event = new Event({
    event_id,
    event_type,
    timestamp,
    transport_id,
    station_id,
    delay
  })

  const savedEvent = await event.save()
  res.json(savedEvent)
})

module.exports = router
