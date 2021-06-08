var mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    name: {type: String, default: ""},
    jobId: {type: String, default: null},
    created: {type: Date, default: Date.now},
    complete: {type: Boolean, default: false}, // true: job has been executed
})

module.exports = mongoose.model('JobModel', jobSchema)