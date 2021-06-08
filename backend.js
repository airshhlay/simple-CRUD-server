var {loadConfig} = require('./config/config-reader')
var {execute} = require('./workers/worker')
var QueueManager = require('./services/rabbitmq-service')
const DatabaseManager = require('./services/database-manager')

var config = loadConfig()

var qm = new QueueManager(config.RMQ_JOB_QNAME, config.RMQ_CONNECTION_URL)
var dm = new DatabaseManager(config.DATABASE_NAME, config.DATABASE_CONNECTION_URL) // this may not be the right way as there may be caching mismatch: unless only cache queries that have the complete: true variable, so in that case it is still fine (??)

var handleIncomingMessage = (msg) => {
    execute()  
    .then(() => {
        dm.updateJob(msg.jobId, {"complete": true})
        .then((res) => console.log(res))
        .catch(err => console.log(err))
    })
    .catch(err => {
        console.log(err)
    })
}

qm.setMessageHandler(handleIncomingMessage)

qm.receiveFromQueue()
.catch(err => {
    console.log(err)
})


/*
Options:
1. Directly call database manager to update job status
2. Create a second queue that handles all database update / delete / add operations
3. Create an API to call that subsequently calls database manager (additional layer of abstraction)
4. Send all non FIND database operations to the queue as well as job messages to the queue, differentiate by adding an additional field in the message such as activity: 'job' / 'database-update' etc
*/

/*
Alternative design patten:
1. Backend.js handles both database operations as well as job execution
2. Messages in queue will specify
*/