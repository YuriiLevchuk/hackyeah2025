const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
  console.log("user")
  const users = await User
    .find({})
  
  res.json(users)
})

router.get('/:id', async (req, res) => {
  const user = await User
    .findById(req.params.id)
  res.json(user)
})

router.post('/', async (req, res) => {
  const { username,first_name, last_name, email, password } = req.body
  const password_hash = await bcrypt.hash(password, 10)
  const user = new User({
    username,
    first_name,
    last_name,
    email,
    password_hash
  })

  const savedUser = await user.save()
  res.json(savedUser)
})

module.exports = router
