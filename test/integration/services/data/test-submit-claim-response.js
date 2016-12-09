const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const config = require('../../../../knexfile').migrations
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')
const databaseHelper = require('../../../helpers/database-setup-for-tests')
const claimDecisionEnum = require('../../../../app/constants/claim-decision-enum')
const tasksEnum = require('../../../../app/constants/tasks-enum')

var stubInsertClaimEvent = sinon.stub().resolves()
var stubInsertTaskSendClaimNotification = sinon.stub().resolves()

const submitClaimResponse = proxyquire('../../../../app/services/data/submit-claim-response', {
  './insert-claim-event': stubInsertClaimEvent,
  './insert-task-send-claim-notification': stubInsertTaskSendClaimNotification
})

var reference = 'SUBC456'
var newIds = {}
var caseworker = 'adam@adams.gov'

describe('services/data/submit-claim-response', function () {
  before(function () {
    return databaseHelper.insertTestData(reference, dateFormatter.now().toDate(), 'NEW').then(function (ids) {
      newIds = {
        claimId: ids.claimId,
        eligibilityId: ids.eligibilityId,
        prisonerId: ids.prisonerId,
        visitorId: ids.visitorId,
        expenseId1: ids.expenseId1,
        expenseId2: ids.expenseId2,
        childId1: ids.childId1,
        childId2: ids.childId2
      }
    })
  })

  it('should update eligibility and claim then call to send notification', function () {
    var claimId = newIds.claimId
    var claimResponse = {
      'caseworker': caseworker,
      'decision': claimDecisionEnum.REJECTED,
      'reason': 'No valid relationship to prisoner',
      'note': 'Could not verify in NOMIS',
      'nomisCheck': claimDecisionEnum.REJECTED,
      'dwpCheck': claimDecisionEnum.REJECTED,
      'claimExpenseResponses': [
        {'claimExpenseId': newIds.expenseId1, 'approvedCost': '10', 'status': claimDecisionEnum.REJECTED},
        {'claimExpenseId': newIds.expenseId2, 'approvedCost': '20', 'status': claimDecisionEnum.REQUEST_INFORMATION}
      ]
    }
    var currentDate = new Date()
    var twoMinutesAgo = new Date().setMinutes(currentDate.getMinutes() - 2)
    var twoMinutesAhead = new Date().setMinutes(currentDate.getMinutes() + 2)

    return submitClaimResponse(claimId, claimResponse)
      .then(function (result) {
        return knex('IntSchema.Eligibility').where('IntSchema.Eligibility.Reference', reference)
          .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
          .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
          .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
          .first()
          .then(function (result) {
            expect(result.Caseworker).to.be.equal(caseworker)
            expect(result.Status[0]).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.Status[1]).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.Reason).to.be.equal(claimResponse.reason)
            expect(result.Note).to.be.equal(claimResponse.note)
            expect(result.NomisCheck).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.DWPCheck).to.be.equal(claimDecisionEnum.REJECTED)
            expect(result.LastUpdated).to.be.within(twoMinutesAgo, twoMinutesAhead)
            expect(result.DateReviewed).to.be.within(twoMinutesAgo, twoMinutesAhead)

            expect(stubInsertClaimEvent.calledWith(reference, newIds.eligibilityId, newIds.claimId, `CLAIM-${claimDecisionEnum.REJECTED}`, null, claimResponse.note, caseworker, false)).to.be.true
            expect(stubInsertTaskSendClaimNotification.calledWith(tasksEnum.REJECT_CLAIM_NOTIFICATION, reference, newIds.eligibilityId, newIds.claimId)).to.be.true

            return knex('IntSchema.ClaimExpense').where('ClaimId', newIds.claimId).select()
              .then(function (claimExpenses) {
                expect(claimExpenses[0].Status).to.be.equal(claimDecisionEnum.REJECTED)
                expect(claimExpenses[0].ApprovedCost).to.be.equal(10)

                expect(claimExpenses[1].Status).to.be.equal(claimDecisionEnum.REQUEST_INFORMATION)
                expect(claimExpenses[1].ApprovedCost).to.be.equal(20)
              })
          })
      })
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
