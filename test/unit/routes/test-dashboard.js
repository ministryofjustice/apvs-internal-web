const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const mockViewEngine = require('./mock-view-engine')
const sinon = require('sinon')
require('sinon-bluebird')

var isCaseworkerStub
var getDashboardDataStub
var authorisation

describe('routes/index', function () {
  var app

  beforeEach(function () {
    getDashboardDataStub = sinon.stub().resolves({})
    isCaseworkerStub = sinon.stub()
    authorisation = { isCaseworker: isCaseworkerStub }

    var route = proxyquire('../../../app/routes/dashboard', {
      '../../app/services/data/dashboard/get-dashboard-data': getDashboardDataStub,
      '../services/authorisation': authorisation
    })

    app = express()
    mockViewEngine(app, '../../../app/views')
    route(app)
  })

  describe('GET /', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/dashboard')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(getDashboardDataStub.calledOnce).to.be.true
        })
    })
  })
})
