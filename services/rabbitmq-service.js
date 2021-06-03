var amqp = require('amqplib/callback_api');

class QueueManager {
    constructor(queueName, connectionURL) {
        this.queue = queueName
        this.url = connectionURL
        this.channel = null
        this.jobId = 0 // first job id will start with 1
    }

    getNewJobId() {
       this.jobId ++
       return this.jobId
    }

    connect () {
        return new Promise((resolve, reject) => {
            if (this.channel !== null) {
                console.log("reusing previously defined channel...")
                resolve(this.channel)
            }

            amqp.connect(this.url, (err, conn) => {
                if (err) {
                    console.log(">> ERROR [connect]: error when calling amqp.connect")
                    reject(err)
                }
    
                console.log(">> SUCCESS [connect]: connected to rabbitmq");
                console.log("attempting to create channel...")
    
                conn.createChannel((err, ch) => {
                    if (err) {
                        console.log(">> ERROR [connect]: ", err)
                        reject(err)
                    }
    
                    console.log(">> SUCCESS [connect]: created a channel")
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
                })
        
                var payloadStr = JSON.stringify(payload)
        
                ch.sendToQueue(this.queue, Buffer.from(payloadStr), {persistent: true})
        
                resolve(console.log(">> SUCCESS [publishToQueue]:  sent to queue with message: ", payloadStr))
            })
            .catch(err => {
                console.log(">> ERROR [publishToQueue] : error occured when connecting to rabbitmq")
                reject(err)
            })
        }
        )
    }

    receiveFromQueue() {
        return new Promise((resolve, reject) => {
            console.log(this.queue)
            this.connect()
            .then(ch => {
                ch.assertQueue(this.queue, {
                    durable: true
                })

                ch.prefetch(1) // prefetch 1 message at a time to avoid distributing resources unevenly

                console.log(`waiting for message from ${this.queue}...`)
                ch.consume(this.queue, payload => {

                var msg = payload.content.toString()
                var msgJSON = JSON.parse(msg)
                console.log(`>> SUCCESS [receiveFromQueue]: received message: ${msg}`)
                resolve(msgJSON)
                }, {noAck: true})
                
            })
            .catch(err => {
                console.log(`>>ERROR [receiveFromQueue]: connection error for ${this.queue}`)
                reject(err)
            })
        })
    }


}

module.exports = QueueManager

