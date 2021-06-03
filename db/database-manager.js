var { connect } = require('http2')
var mongodb = require('mongodb')
var Job = require('./model/job.js')
var mongoose = require('mongoose')
const { error } = require('console')

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
    Returns a new promise
    */
    modifyJob(jobDetails) {
        return new Promise((resolve, reject) => {
            Job.updateOne({
                name: jobDetails.name,
                jobId: jobDetails.jobId
            })
            .then(
                resolve()
            )
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
            .then(
                resolve()
            )
            .catch(err => {
                reject(err)
            })
        })
    }

    /*
    Lists all jobs
    */
    listJobs() {
        var jobLst = []
        Job.find({}, (err, res) => {
            if (err) {
                return console.log(err)
            }
            res.forEach((job) => {
                var jobJson = {
                    "jobId": job.jobId,
                    "name": job.name,
                }
                jobLst.push(jobJson)
            })
        })
        return jobLst
    }
}

module.exports = DatabaseManager