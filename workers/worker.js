/*
Receives job from the job queue
Performs the job
Sends the job completion status to the status queue
*/
var jobConsumer = require('../services/jobs/job-consumer.js')
var statusProducer = require('../services/status/status-producer.js.js')

class Worker {
    constructor()

    execute(job) {
        
    }
}