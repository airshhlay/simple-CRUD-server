var express = require('express')
var {check, body, validationResult} = require('express-validator')
const DatabaseManager = require('../services/database-manager')
var router = express.Router()

// APIs called by user

/*
GET request
List all jobs in the database
*/
router.get('/listall', (req, res) => {
    console.log("listall called")
    var dm = req.dm

    dm.listJobs()
    .then((jobLst) => {
        return res.status(200).send(jobLst)
    })
    .catch(err => {
        return res.status(400).send(err)
    })
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
var modifyParamCheck = [
    body('jobId').exists()
]
router.put('/put', modifyParamCheck, (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).send("specify jobId in body")
    }

    var jobDetails = req.body
    var jobId = jobDetails.jobId
    delete jobDetails.jobId
    console.log(jobId)
    console.log(jobDetails)

    var dm = req.dm

    dm.updateJob(
        jobId, jobDetails
    )
    .then((updateRes) => {
        if (updateRes.nModified === 0) {
            // nothing has been modified
            return res.status(400).send("could not modify job: did you specify jobId correctly?")
        }
        console.log(updateRes)
        console.log(">> SUCCESS [put request]: modified correctly")

        res.status(200).send(`Modified the details for job ${jobId}`)
    })
    .catch((err) => {
        console.log(">> ERROR [put request]")
        console.log(err)
        res.status(500).send("Internal server error: unable to modify job. Did you specify jobId and update fields correctly?")
    })
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
    .then((delRes) => {
        if (delRes.deletedCount === 0) {
            return res.status(400).send("Unable to delete job. Did you specify the correct jobId?")
        }
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
var resultsParamCheck = [
    check("jobId").exists()
]
router.get('/results', resultsParamCheck, (req, res) => {
    console.log('results called')

    if (!validationResult(req).isEmpty()) {
        return res.status(400).send("did you specify the jobId?")
    }

    var dm = req.dm

    var jobId = req.query.jobId

    dm.getJob(jobId)
    .then((getRes) => {
        if (getRes) {
            var resJSON = {
                "jobId": getRes.jobId,
                "name": getRes.name,
                "complete": getRes.complete,
                "created": getRes.created
            }
            res.status(200).send(resJSON)
        } else {
            res.status(400).send("no such job in the database")
        }
    })
    .catch( err => {
        console.log(err)
        res.status(500).send("Error in connecting to database")
    }
    )
})

/*
Get a specified number of jobs from the database, sorted by created timestamp (newest to oldest)
*/
var listNumberParamCheck = [
    check("numberJobs").exists()
]
router.get('/list', listNumberParamCheck, (req, res) => {
    console.log("list number called")

    if (!validationResult(req).isEmpty()) {
        return res.status(400).send("specify the number of jobs to retrieve")
    }

    var dm = req.dm
    var numberJobs = req.query.numberJobs

    dm.getJobs(numberJobs)
    .then((getRes) => {
        if (getRes) {
            var jobLst = []
            getRes.forEach(job => {
                var resJSON = {
                    "jobId": getRes.jobId,
                    "name": getRes.name,
                    "complete": getRes.complete,
                    "created": getRes.created
                }
                jobLst.push(resJSON)
            })

            res.status(200).send(jobLst)
        } else {
            res.status(400).send("no jobs in the database")
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).send("error in retrieving records from database")
    })
})

module.exports = router