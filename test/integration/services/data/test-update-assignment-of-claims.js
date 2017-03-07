const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../knexfile').intweb
const knex = require('knex')(config)
const databaseHelper = require('../../../helpers/database-setup-for-tests')

const updateAssignmentOfClaims = require('../../../../app/services/data/update-assignment-of-claims')
var reference = 'ASSIGN1'
var date
var previousLastUpdated
var claimId

describe('services/data/update-assignment-of-claim', function () {
  describe('module', function () {
    before(function () {
      date = dateFormatter.now()
      return databaseHelper.insertTestData(reference, date.toDate(), 'TESTING').then(function (ids) {
        claimId = ids.claimId
        previousLastUpdated = ids.lastUpdated
      })
    })

    it(`should assign a claim, setting the time and updating when it was last updated`, function () {
      var assignedTo = 'test@test.com'
      var currentDate = new Date()
      var twoMinutesAgo = new Date().setMinutes(currentDate.getMinutes() - 2)
      var twoMinutesAhead = new Date().setMinutes(currentDate.getMinutes() + 2)
      return updateAssignmentOfClaims(reference, claimId, assignedTo)
        .then(function () {
          return knex('Claim').first().where('ClaimId', claimId)
            .then(function (claim) {
              expect(claim.AssignedTo).to.equal(assignedTo)
              expect(claim.AssignmentTime).to.be.within(twoMinutesAgo, twoMinutesAhead)
              expect(claim.LastUpdated).to.not.equal(previousLastUpdated)
            })
        })
        .catch(function (error) {
          throw error
        })
    })

    after(function () {
      return databaseHelper.deleteAll(reference)
    })
  })
})