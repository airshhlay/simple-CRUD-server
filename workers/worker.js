/*
Receives job from the job queue
Performs the job
Sends the job completion status to the status queue
*/
class Worker {
    constructor(jobDetails) {
        this.jobDetails = jobDetails
    }


    execute() {
        // execute job
        return new Promise((resolve, reject) => {
            setTimeout(() => console.log("executed job"))
        })
        // then post job update by either
        // 1. adding to a separate rmq
        // 2. directly calling server api to update
    }
}

module.exports = Worker