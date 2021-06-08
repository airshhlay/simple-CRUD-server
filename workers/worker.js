/*
Receives job from the job queue
Performs the job
Sends the job completion status to the status queue
*/

var execute = () => {
    // execute job
    // execute a dummy job (set timeout)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("executed job")
            resolve()
        }, 5000)
    })
    // then post job update by either
    // 1. adding to a separate rmq
    // 2. directly calling server api to update
}


module.exports.execute = execute
    // then post job update by either
    // 1. adding to a separate rmq
    // 2. directly calling server api to update
