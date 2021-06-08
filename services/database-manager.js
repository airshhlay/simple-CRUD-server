var {
    connect
} = require('http2')
var Job = require('../model/job.js')
var mongoose = require('mongoose')
var cache = require('./cache')
const {
    clearCache,
    checkCache,
    setCache,
    deleteCacheById
} = require('./cache')

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
        mongoose.connect(`${this.connectionUrl}/${this.databaseName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
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
            checkCache(jobId)
                .then(cacheRes => {
                    if (cacheRes !== null) {
                        console.log("data in cache")
                        return resolve(JSON.parse(cacheRes))
                    }
                    Job.findOne({
                        jobId: jobId
                    })
                        .exec()
                        .then(res => {
                            setCache(jobId, res)
                            return resolve(res)
                        })
                        .catch(err => {
                            return reject(err)
                        })
                })
        })
    }

    // get the last <number> jobs submitted to the database
    // NOT IN USE
    getJobs(number) {
        return new Promise((resolve, reject) => {
            Job.find({})
                .exec()
                .sort({
                    "created": -1
                })
                .limit(number)
                .then(res => {
                    return resolve(res)
                })
                .catch(err => {
                    return reject(err)
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
            // clearCache()
            //     .then(() => {
            // create job defined in model
            var job = new Job({
                name: jobDetails.name,
                jobId: jobDetails.jobId
            })
            // save to database
            var created
            job.save((err, res) => {
                if (err) {
                    return reject(err)
                }
                created = {
                    "jobId": res.jobId,
                    "name": res.name,
                    "complete": res.complete,
                    "created": res.created,
                }
            })
            console.log("Created: " + created)
            setCache(jobDetails.jobId, created) // set cache
            return resolve(jobDetails.jobId)
        })
            .catch(err => {
                console.log(TypeError)
                return reject(err)
            })
        // })
    }

    /*
    Modify the name of the job
    jobDetails is a JSON object specifying the required updates
    Returns a new promise
    */
    updateJob(jobId, jobDetails) {
        return new Promise((resolve, reject) => {
            deleteCacheById(jobId) // clear cache
                .then(() => {
                    Job.findOneAndUpdate({
                        jobId: jobId
                    }, jobDetails, {
                        runValidators: true,
                        new: true,
                        useFindAndModify: false
                    })
                        .exec()
                        .then(res => {
                            var created = {
                                "jobId": res.jobId,
                                "name": res.name,
                                "complete": res.complete,
                                "created": res.created,
                            }
                            setCache(jobId, created)
                            return resolve(res)
                        })
                        .catch(err => {
                            return reject(err)
                        })
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }

    /*
    Deletes a job from a database with the given jobId
    Returns a new promise
    */
    deleteJob(jobId) {
        return new Promise((resolve, reject) => {
            deleteCacheById(jobId)
                .then(() => {
                    Job.deleteOne({
                        jobId: jobId
                    })
                        .then(res => {
                            return resolve(res)
                        })
                        .catch(err => {
                            return eject(err)
                        })
                })
                .catch(err => {
                    return reject(err)
                })

        })
    }

    /*
    Lists all jobs
    NOT IN USE
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
                    return resolve(jobLst)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }
}

module.exports = DatabaseManager