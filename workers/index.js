var config = require('../config/config-reader')
var Worker = require('./worker')
var QueueManager = require('../services/rabbitmq-service')

var config = loadConfig()
// // config dotenv
// dotenv.config({
//     path: __dirname + '../env'
// })

var jobQManager = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)
var w = new Worker(jobQManager)
w.listen()