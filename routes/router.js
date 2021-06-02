var express = require('express')
var {check, body, validationResult} = require('express-validator')
const DatabaseManager = require('../db/database-manager')
var router = express.Router()

// APIs called by user

/*
GET request
List all jobs in the database
*/
router.get('/listall', (req, res) => {
    console.log("listall called")
    var dm = req.dm
    var databaseRes = dm.listJobs()
    console.log(databaseRes)

    if (databaseRes.length === 0) {
        res.status(200).send("No jobs in the database")
    } else {
        res.status(200).send(databaseRes)
    }
}
) 

/*
POST request
Submit a new async job
Returns a job id and status code 202 ('Accepted')

Use a fake job
*/
var submitParamCheck = [
    body('name').exists(),
]
router.post('/submit', submitParamCheck, (req, res) => {
    console.log("submit called")
    // validationResult(req).throw()
    if (!validationResult(req).isEmpty()) {
        return res.status(400).send("name parameter not specified / not specified correctly")
    }

    var dm = req.dm // database manager
    var qm = req.qm // queue manager

    var job = req.body

    // get new job id from queue manager
    var jobId = qm.getNewJobId()

    dm.addJob({
        name: job.name,
        jobId: jobId
    })
    .then(jobId => {
        // add to rmq with the specified jobId
        qm.publishToQueue({jobId: jobId})
        .then(res.sendStatus(202))
        .catch(err => {
            res.status(500).send("Internal Server Error: unable to queue job")
        })
    })
    .catch(err => {
        res.status(500).send("Internal Server Error: unable to add job to database")
    })
})

/*
PUT request
Modifies an existing job
Requires a job id to be specified
*/
router.put('/put', (req, res) => {
    console.log('put')
})

/*
DELETE request
Deletes a job with the specified job ID
If the job is not in the database, returns an error
*/
var deleteParamCheck = [
    check('jobId').exists(),
    check('jobId').isNumeric()
]
router.delete('/delete', deleteParamCheck, (req, res) => {
    console.log('delete called')

    if (!validationResult(req).isEmpty()) {
        return res.status(400).send("jobId parameter not specified / not specified correctly")
    }

    var dm = req.dm

    var jobId = req.query.jobId

    dm.deleteJob(jobId)
    .then(() => {
        return res.status(200).send(`Deleted job ${jobId} succcessfully`)
    })
    .catch(err => {
        return res.status(500).send(`unable to find job ${jobId} in database`)
    }) 
}
)

/*
Retrieve the results of a previously submitted job
Accepts a job ID or a list of job IDs to get those specific jobs
If no job ID is specified, return all previously submitted jobs
*/
router.get('/results', (req, res) => {
    console.log('results called')
})

module.exports = router