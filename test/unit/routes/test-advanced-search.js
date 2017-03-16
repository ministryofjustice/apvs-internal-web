const supertest = require('supertest')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const express = require('express')
const queryString = require('querystring')
const bodyParser = require('body-parser')
const dateFormatter = require('../../../app/services/date-formatter')
const path = require('path')
const sinon = require('sinon')
require('sinon-bluebird')

var getClaimListForAdvancedSearch
var displayHelperStub
var authorisation
var isCaseworkerStub
var exportSearchResultsStub

var draw = 1
var start = 0
var length = 10

const EXPECTED_DATE_FROM = dateFormatter.build('12', '12', '2016').startOf('day').toDate()
const EXPECTED_DATE_TO = dateFormatter.build('12', '12', '2016').endOf('day').toDate()

const INPUT_SEARCH_CRITERIA = {
  start: start,
  length: length,
  reference: 'APVS123',
  name: 'testName',
  ninumber: 'apvs1234',
  prisonerNumber: 'apvs12345',
  prison: 'hewell',
  assistedDigital: 'true',
  claimStatus: 'pending',
  modeOfApproval: 'auto',
  pastOrFuture: 'past',
  visitRules: 'englandScotlandWales',
  approvedClaimAmountFrom: '12',
  approvedClaimAmountTo: '12',
  visitDateFromDay: '12',
  visitDateFromMonth: '12',
  visitDateFromYear: '2016',
  visitDateToDay: '12',
  visitDateToMonth: '12',
  visitDateToYear: '2016',
  dateSubmittedFromDay: '12',
  dateSubmittedFromMonth: '12',
  dateSubmittedFromYear: '2016',
  dateSubmittedToDay: '12',
  dateSubmittedToMonth: '12',
  dateSubmittedToYear: '2016',
  dateApprovedFromDay: '12',
  dateApprovedFromMonth: '12',
  dateApprovedFromYear: '2016',
  dateApprovedToDay: '12',
  dateApprovedToMonth: '12',
  dateApprovedToYear: '2016',
  dateRejectedFromDay: '12',
  dateRejectedFromMonth: '12',
  dateRejectedFromYear: '2016',
  dateRejectedToDay: '12',
  dateRejectedToMonth: '12',
  dateRejectedToYear: '2016'
}

const PROCESSED_SEARCH_CRITERIA = {
  reference: 'APVS123',
  name: 'testName',
  ninumber: 'apvs1234',
  prisonerNumber: 'apvs12345',
  prison: 'hewell',
  pastOrFuture: 'past',
  visitRules: 'englandScotlandWales',
  approvedClaimAmountFrom: '12',
  approvedClaimAmountTo: '12',
  assistedDigital: true,
  claimStatus: 'PENDING',
  modeOfApproval: 'AUTOAPPROVED',
  visitDateFrom: EXPECTED_DATE_FROM,
  visitDateTo: EXPECTED_DATE_TO,
  dateSubmittedFrom: EXPECTED_DATE_FROM,
  dateSubmittedTo: EXPECTED_DATE_TO,
  dateApprovedFrom: EXPECTED_DATE_FROM,
  dateApprovedTo: EXPECTED_DATE_TO,
  dateRejectedFrom: EXPECTED_DATE_FROM,
  dateRejectedTo: EXPECTED_DATE_TO
}

const INVALID_DATE_FIELDS = {
  visitDateFromDay: 'aa',
  visitDateFromMonth: '12',
  visitDateFromYear: '2016',
  visitDateToDay: '12',
  visitDateToMonth: 'aa',
  visitDateToYear: '2016',
  dateSubmittedFromDay: 'aa',
  dateSubmittedFromMonth: 'aa',
  dateSubmittedFromYear: '2016',
  dateSubmittedToDay: '12',
  dateSubmittedToMonth: '12',
  dateSubmittedToYear: 'AAAA',
  dateApprovedFromDay: 'aa',
  dateApprovedFromMonth: '12',
  dateApprovedFromYear: '2016',
  dateApprovedToDay: '12',
  dateApprovedToMonth: 'aa',
  dateApprovedToYear: '2016',
  dateRejectedFromDay: 'aa',
  dateRejectedFromMonth: 'aa',
  dateRejectedFromYear: '2016',
  dateRejectedToDay: '12',
  dateRejectedToMonth: 'aa',
  dateRejectedToYear: '2016'
}

const INVALID_AMOUNTS = {
  approvedClaimAmountFrom: 'AA',
  approvedClaimAmountTo: 'AA'
}

const EXPECTED_VALIDATION_ERRORS = {
  visitDateFrom: [ 'Visit date (from) is invalid' ],
  visitDateTo: [ 'Visit date (to) is invalid' ],
  dateSubmittedFrom: [ 'Date submitted (from) is invalid' ],
  dateSubmittedTo: [ 'Date submitted (to) is invalid' ],
  dateApprovedFrom: [ 'Date approved (from) is invalid' ],
  dateApprovedTo: [ 'Date approved (to) is invalid' ],
  dateRejectedFrom: [ 'Date rejected (from) is invalid' ],
  dateRejectedTo: [ 'Date rejected (to) is invalid' ],
  approvedClaimAmountFrom: [ 'Approved claim amount (from) is invalid' ],
  approvedClaimAmountTo: [ 'Approved claim amount (to) is invalid' ]
}

const RETURNED_CLAIM = {
  Reference: 'SEARCH1',
  FirstName: 'John',
  LastName: 'Smith',
  DateSubmitted: '2016-11-29T00:00:00.000Z',
  ClaimType: 'first-time',
  ClaimId: 1,
  DateSubmittedFormatted: '28-11-2016 00:00',
  Name: 'John Smith'
}

var errorsReturnedToView = {}

describe('routes/index', function () {
  var app

  beforeEach(function () {
    isCaseworkerStub = sinon.stub()
    authorisation = { isCaseworker: isCaseworkerStub }
    getClaimListForAdvancedSearch = sinon.stub()
    displayHelperStub = sinon.stub({ 'getClaimTypeDisplayName': function () {} })
    displayHelperStub.getClaimTypeDisplayName.returns('First time')
    exportSearchResultsStub = sinon.stub().resolves('')

    var route = proxyquire('../../../app/routes/advanced-search', {
      '../services/authorisation': authorisation,
      '../services/data/get-claim-list-for-advanced-search': getClaimListForAdvancedSearch,
      '../views/helpers/display-helper': displayHelperStub,
      '../services/export-search-results': exportSearchResultsStub
    })

    app = express()

    app.engine('html', function (filePath, options, callback) {
      errorsReturnedToView = options.errors
      var rendered = `${filePath}: ${JSON.stringify(options)}`
      return callback(null, rendered)
    })
    app.set('view engine', 'html')
    app.set('views', [ path.join(__dirname, '../../../app/views'), path.join(__dirname, '../../../lib/') ])
    app.use(bodyParser.json())

    route(app)
  })

  describe('GET /advanced-search-input', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-input')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })
  })

  describe('GET /advanced-search', function () {
    it('should respond with a 200 for no query string', function () {
      return supertest(app)
        .get('/advanced-search')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })

    it('should respond with a 200 with query string', function () {
      return supertest(app)
        .get('/advanced-search?Reference=V123456')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
        })
    })

    it('should return validation errors for invalid data', function () {
      var searchQueryString = `${queryString.stringify(INVALID_DATE_FIELDS)}&${queryString.stringify(INVALID_AMOUNTS)}`

      return supertest(app)
        .get(`/advanced-search?${searchQueryString}&draw=${draw}&start=${start}&length=${length}`)
        .expect(function (response) {
          expect(errorsReturnedToView).to.deep.equal(EXPECTED_VALIDATION_ERRORS)
        })
    })
  })

  describe('POST /advanced-search-results', function () {
    it('should respond with a 200 and call data method', function () {
      getClaimListForAdvancedSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})
      return supertest(app)
        .post(`/advanced-search-results`)
        .send({start: start, length: length})
        .expect(200)
        .expect(function (response) {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(getClaimListForAdvancedSearch.calledWith({}, start, length), 'expected data method to be called with empty search criteria').to.be.true
          expect(response.body.recordsTotal).to.equal(1)
          expect(response.body.claims[0].ClaimTypeDisplayName).to.equal('First time')
        })
    })

    it('should extract search criteria correctly', function () {
      getClaimListForAdvancedSearch.resolves({claims: [RETURNED_CLAIM], total: {Count: 1}})

      return supertest(app)
        .post(`/advanced-search-results`)
        .send(INPUT_SEARCH_CRITERIA)
        .expect(function (response) {
          expect(getClaimListForAdvancedSearch.calledWith(sinon.match(PROCESSED_SEARCH_CRITERIA), start, length), 'expected data method to be called with processed search criteria').to.be.true
        })
    })

    it('should respond with a 500 promise rejects', function () {
      app.use(function (req, res, next) {
        next(new Error())
      })
      app.use(function (err, req, res, next) {
        if (err) {
          res.status(500).render('includes/error')
        }
      })
      getClaimListForAdvancedSearch.rejects()
      return supertest(app)
        .post('/advanced-search-results')
        .expect(500)
    })
  })

  describe('GET /advanced-search-results/export', function () {
    it('should respond with a 200', function () {
      return supertest(app)
        .get('/advanced-search-results/export?')
        .expect(200)
        .expect(function () {
          expect(isCaseworkerStub.calledOnce).to.be.true
          expect(exportSearchResultsStub.calledOnce).to.be.true
        })
    })
  })
})
