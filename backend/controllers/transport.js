const transportRouter = require('express').Router()
const Transport = require('../models/transport')

transportRouter.get('/', async (req, res) => {
  const transports = await Transport
    .find({})
  res.json(transports)
});

transportRouter.get('/:id', async (req, res) => {
  const transport = await Transport
    .findById(req.params.id)
  res.json(transport)
});

transportRouter.post('/', async (req, res) => {
  const {transport_id, transport_type, stop_list} = req.body

  const transport = new Transport({
    transport_id,
    transport_type,
    stop_list
  })

  const savedTransport = await transport.save()
  res.json(savedTransport)
});

module.exports = transportRouter