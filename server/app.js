const express = require('express')
const bodyParser = require('body-parser')
const createError = require('http-errors')
require('dotenv').config()

// Create express instance
const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Require API routes
const route = require('./routes/index')
// Import API Routes
app.use('/', route)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

app.use((err, req, res, next) => {
  console.log(err)
  // console.log(err)
  // return error status and message to the requester
  res.status(err.statusCode || err.Status || 500).json({
    Code: err.Code || err.code || 500,
    Message: err.Message || err.message
  })
})

// Export express app
module.exports = app
