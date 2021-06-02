var amqp = require('amqplib/callback_api');
var url = process.env.RMQ_CONNECTION_URL
var queue = process.env.JOB_QUEUE

class QueueManager {
    constructor(queueName) {
        this.queue = queueName
        this.connection = null
        this.channel = null
    }

    getNewJobId() {
        var jobId = parseInt(process.env.LAST_JOB_ID, 10) + 1
        process.env.LAST_JOB_ID = jobId
        return jobId
    }

    connect () {
        return new Promise((resolve, reject) => {
            if (this.channel !== undefined) {
                console.log("reusing previously defined channel...")
                resolve(this.channel)
            }

            amqp.connect(url, (err, conn) => {
                if (err) {
                    console.log(">> ERROR: ", err)
                    reject(err)
                }
    
                console.log(">> SUCCESS: connected to rabbitmq");
                console.log("attempting to create channel...")
    
                conn.createChannel((err, ch) => {
                    if (err) {
                        console.log(">> ERROR: ", err)
                        reject(err)
                    }
    
                    console.log(">> SUCCESS: created a channel")
                    this.channel = ch
                    resolve(ch)
                })
            })
        })
    }

    publishToQueue(payload) {
        return new Promise((resolve, reject) => {
            this.connect()
            .then(ch => {
                ch.assertQueue(this.queue, {
                    durable: true
                });
        
                var payloadStr = JSON.stringify(payload)
        
                ch.sendToQueue(this.queue, Buffer.from(payloadStr), {persistent: true})
        
                resolve(console.log(">> SUCCESS: sent to queue with message: ", payloadStr))
            })
            .catch(err => {
                console.log(">> ERROR: error occured when connecting to rabbitmq")
                reject(err)
            })
        }
        )
    }

    receiveFromQueue() {
        return new Promise((resolve, reject) => {

        })
    }


}

module.exports = QueueManager

