var express = require('express')
var swaggerUi = require("swagger-ui-express");
var swaggerDocument = require('./swagger.json')
var DatabaseManager = require('./db/database-manager.js')
var router = require('./routes/router.js')
var QueueManager = require('./services/rabbitmq-service.js')
var Worker = require('./workers/worker')
var loadConfig = require('./config/config-reader')

// configurations
var config = loadConfig()
// create database manager instance
var databaseManager = new DatabaseManager(config.DATABASE_NAME, config.MONGO_CONNECTION_URL)

// create queue manager instance
var statusQManager = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)
var jobQManager = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)


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
app.listen(config.PORT, config.HOST, () => {
    console.log(">> SUCCESS: server is up on port " + config.PORT)
})