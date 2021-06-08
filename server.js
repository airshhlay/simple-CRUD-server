var express = require('express')
var morgan = require('morgan')
var rfs = require('rotating-file-stream')
var fs = require('fs')
var swaggerUi = require("swagger-ui-express");
var swaggerDocument = require('./swagger.json')
var DatabaseManager = require('./services/database-manager.js')
var router = require('./routes/router.js')
var QueueManager = require('./services/rabbitmq-service.js')
var {loadConfig, getSavedData, updateSavedData} = require('./config/config-reader')
var path = require('path')
var {clearCache} = require('./services/cache')

// config
var config = loadConfig()
var savedData = getSavedData()

// create database manager instance
var databaseManager = new DatabaseManager(config.DATABASE_NAME, config.DATABASE_CONNECTION_URL)

// create queue manager instance
var queueManager = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)
queueManager.setJobId(savedData.lastJobId)

// create a rotating write stream for logging
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
  })

// create express app
var app = express()

// setup express middleware
app.use(morgan('combined', { stream: accessLogStream })) // logger middleware
app.use(express.json()) // parsing
app.use(express.urlencoded({
    extended: false
}))
app.use('/jobs', (req, res, next) => { // use router
    req.qm = queueManager
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


// save the last job id on process interrupt
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");

    savedData.lastJobId = queueManager.getCurrentJobId()

    updateSavedData(savedData)
    clearCache()

    process.exit()
});

module.exports = app