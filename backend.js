var config = require('./config/config-reader')
var Worker = require('./workers/worker')
var QueueManager = require('./services/rabbitmq-service')

var config = loadConfig()
var qm = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)

qm.receiveFromQueue().then(
    (msg) => {
        var worker = new Worker(msg)
        worker.execute()
    }
)
