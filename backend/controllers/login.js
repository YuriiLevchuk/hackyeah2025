const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

loginRouter.post('/', async(req, res)=>{
  const { username, password } = req.body
  const user = await User.findOne({username})
  console.log(user)

  const passwordCorrect = user.password_hash === null
    ? false
    : await bcrypt.compare(password, user.password_hash)

  if(!(user && passwordCorrect)){
    return res.status(401).json({ error: 'invalid username or password' })
  }

  console.log(process.env.SECRET)
  const token = jwt.sign(
    { username:user.username, id:user._id },
    process.env.SECRET,
    { expiresIn: 60*60 } // hour to expire
  )

  res.status(201).send({ 
    token, 
    username:user.username,
    name:user.name
  })
})

module.exports = loginRouter