process.env.NODE_ENV = 'TEST';

var assert = require('assert')
var chai = require('chai')
var chaiHttp = require('chai-http')
var mongoose = require('mongoose');
var Job = require('../model/job');
var server = require('../server')


// configure chai
chai.use(chaiHttp)
chai.should() // use should interface


/* Test GET route */
describe('/GET specific job', () => {
  it('it should GET the job with the specified jobId', (done) => {
    chai.request(server)
    .get('/jobs/results')
    .query({jobId: 1})
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.be.a('object')
      done()
    })
  })
})

/* Test POST route */
// describe('POST a job', () => {
//   it('it should POST a new job'), (done) => {
//     chai.request(server)
//     .post('jobs/submit')
//     .send({
//       name: "postTest"
//     })
//     .end((err, res) => {
//       res.should.have.status(200)
//       done()
//     })
//   }
// })

/* Test DELETE route */
describe('DELETE a job',() => {
  it('it should DELETE the specified job', (done) => {
    chai.request(server)
    .delete('jobs/delete')
    .query({jobId: 1})
    .end((err, res) => {
      res.should.have.status(200)
      done()
    })
  })
})

