process.env.NODE_ENV = 'TEST';
var assert = require('assert')
var chai = require('chai')
var chaiHttp = require('chai-http')
var mongoose = require('mongoose');
var Job = require('../model/job');
var server = require('../server')
var data = require('./data.json')

// configure chai
chai.use(chaiHttp)
chai.should() // use should interface

beforeEach(() => {
  Job.deleteMany({}, (err, res) => {
    if (err) {
      console.log("error in delete many")
    }
    console.log(">> SUCCESS: test setup- clear db")
  })

  Job.insertMany(data, (err, res) => {
    if (err) {
      console.log("error in insert many")
    }
    console.log(">> SUCCESS: test setup - insert records")
  })
})

/* Test GET route */
describe('/GET specific job', () => {
  it('it should GET the job with the specified jobId', (done) => {
    chai.request(server)
      .get('/jobs/results')
      .query({
        jobId: 1
      })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        done()
      })
  })
})

describe('/GET specific job', () => {
  it('it should not be able to GET the job with the specified jobId', (done) => {
    chai.request(server)
      .get('/jobs/results')
      .query({
        jobId: 100
      })
      .end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })
})


/* Test DELETE route */
describe('DELETE a job', () => {
  it('it should DELETE the specified job', (done) => {
    chai.request(server)
      .delete('/jobs/delete')
      .query({
        "jobId": 2
      })
      .end((err, res) => {
        res.should.have.status(200)
        done()
      })
  })
})

describe('DELETE a job', () => {
  it('it should not be able to DELETE the specified job', (done) => {
    chai.request(server)
      .delete('/jobs/delete')
      .query({
        "jobId": 100
      })
      .end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })
})

/*
Test UPDATE route
*/
describe('UPDATE a job', () => {
  it('it should UPDATE the specified job', (done) => {
    chai.request(server)
      .put('/jobs/put')
      .send({
        "jobId": 1,
        "name": "hello"
      })
      .end((err, res) => {
        res.should.have.status(200)
        done()
      })
  })
})
