var mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    name: {type: String, default: ""},
    jobId: {type: String, default: null},
    start: { type: Date, default: null }, // job timestamp,
    end: {type: Date, default: null},
    created: {type: Date, default: Date.now},
    complete: {type: Boolean, default: false}, // true: job has been executed
    timeout: {type: Number, default: 2000} // duration in milliseconds, submitted by the user
})

// jobSchema.methods.execute = () => {
//     setTimeout(() => {
//         console.log(`Job name: ${this.name} executed.`)
//     }, this.timeout)
// }

module.exports = mongoose.model('JobModel', jobSchema)