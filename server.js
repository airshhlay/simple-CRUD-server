var dotenv = require('dotenv')
var express = require('express')
var bodyparser = require('body-parser')
var swaggerUi = require("swagger-ui-express");
var swaggerDocument = require('./swagger.json')
var DatabaseManager = require('./db/database-manager.js')
var queueManager = require('./services/rabbitmq-service.js')
var router = require('./routes/router.js')
var QueueManager = require('./services/rabbitmq-service.js')

// config dotenv
dotenv.config({
    path: __dirname + '/.env'
})

// connect to database
var databaseManager = new DatabaseManager()

// set up rabbitmq
var jobQueue = process.env.JOB_QNAME
var statusQueue = process.env.STATUS_QNAME
var jobQManager = new QueueManager(jobQueue)
var statusQManager = new QueueManager(statusQueue)

// express middleware
var app = express()
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use('/jobs', (req, res, next) => {
    req.qm = jobQManager
    req.dm = databaseManager
    next()
}, router)

// swagger API
app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

// start the server
app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(">> SUCCESS: server is up on port " + process.env.PORT)
})