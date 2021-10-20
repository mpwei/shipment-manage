const express = require('express')
const bodyParser = require('body-parser')
const createError = require('http-errors')
require('dotenv').config()

// Create express instance
const index = express()
index.use(express.json())
index.use(bodyParser.json())
index.use(bodyParser.urlencoded({extended: true}))

const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({
      credential: admin.credential.cert({
          projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL
      }),
      databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL
  })
}
admin.firestore().settings({ignoreUndefinedProperties:true})

// Require API routes
const IndexRoute = require('./routes/index')
const ShipmentRoute = require('./routes/shipment')

// Import API Routes
index.use(process.env.SERVER_PREFIX + '/', IndexRoute)
index.use(process.env.SERVER_PREFIX + '/shipment', ShipmentRoute)

// catch 404 and forward to error handler
index.use(function(req, res, next) {
    next(createError(404))
})

index.use((err, req, res, next) => {
  console.log(err)
  // console.log(err)
  // return error status and message to the requester
  res.status(err.statusCode || err.Status || 500).json({
    Code: err.Code || err.code || 500,
    Message: err.Message || err.message
  })
})

// Export express app
module.exports = index
