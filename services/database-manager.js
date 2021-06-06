var { connect } = require('http2')
var Job = require('../model/job.js')
var mongoose = require('mongoose')

// var connectionUrl = 'mongodb://127.0.0.1:27017'
// var databaseName = 'onboarding-assignment'
// define our database:
/*
Fields:
1. JobID (integer)
2. Date / Time created (date time)
3. Job type (string)
4. Completed (true / false)
*/

class DatabaseManager {
    constructor(databaseName, connectionURL) {
        this.databaseName = databaseName
        this.connectionUrl = connectionURL
        this.connect()
    }

    connect() {
        mongoose.connect(`${this.connectionUrl}/${this.databaseName}`, {useNewUrlParser: true, useUnifiedTopology: true})
        .then((db) => {
            console.log(">> SUCCESS: Database connected")
        }).catch((err) => {
            console.log(">> ERROR: Database connection error")
        })
    }

    /*
    Retrieve the results of a previously submitted job using jobId
    Returns a new promise
    */
    getJob(jobId) {
        return new Promise((resolve, reject) => {
            Job.findOne({
                jobId: jobId
            })
            .exec()
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
        })
    }

    // get the last <number> jobs submitted to the database
    getJobs(number) {
        return new Promise((resolve, reject) => {
            Job.find({})
            .exec()
            .sort({"created": -1})
            .limit(number)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
        })
    }

    /*
    POST request
    Submit a new async job
    Returns a new promise

    Use a fake job
    */
    addJob(jobDetails) {
        return new Promise((resolve, reject) => {
            // create job defined in model
            var job = new Job({
                name: jobDetails.name,
                jobId: jobDetails.jobId
            })
            // save to database
            var created
            job.save((err, res) => {
                if (err) {
                    reject(err)
                }
                created = res
            })

            resolve(jobDetails.jobId)
        })
    }

    /*
    Modify the name of the job
    jobDetails is a JSON object specifying the required updates
    Returns a new promise
    */
    updateJob(jobId, jobDetails) {
        return new Promise((resolve, reject) => {
            Job.updateOne({jobId: jobId}, jobDetails, {runValidators: true})
            .exec()
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
        })
    }

    /*
    Deletes a job from a database with the given jobId
    Returns a new promise
    */
    deleteJob(jobId) {
        return new Promise((resolve, reject) => {
            Job.deleteOne({
                jobId: jobId
            })
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
        })
    }

    /*
    Lists all jobs
    */
    listJobs() {
        return new Promise((resolve, reject) => {
            var jobLst = []
            Job.find({})
            .cache()
            .then((res) => {
                res.forEach((job) => {
                    jobLst.push({
                        "jobId": job.jobId,
                        "name": job.name,
                        "complete": job.complete,
                        "created": job.created
                    })
                })
                resolve(jobLst)
            })
            .catch(err => {
                reject(err)
            }) 
        })
    }
}

module.exports = DatabaseManager