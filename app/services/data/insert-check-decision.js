const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const getCheckResultId = require('./get-check-result-id')
const ClaimDecisionEnum = require('../../constants/claim-decision-enum')

module.exports = function (claim, checkResponse, checkNumber, caseworker) {
  return getCheckResultId(checkResponse.decision)
    .then(function (CheckResultId) {
      var updateObject
      var event
      if (checkNumber === 1) {
        updateObject = {
          Check1ResultId: CheckResultId,
          Check1Comments: checkResponse.comments
        }
        if (checkResponse.decision === ClaimDecisionEnum.APPROVED) {
          event = claimEventEnum.CHECK_1_APPROVED.value
        } else {
          event = claimEventEnum.CHECK_1_REJECTED.value
        }
      } else {
        updateObject = {
          Check2ResultId: CheckResultId,
          Check2Comments: checkResponse.comments
        }
        if (checkResponse.decision === ClaimDecisionEnum.APPROVED) {
          event = claimEventEnum.CHECK_2_APPROVED.value
        } else {
          event = claimEventEnum.CHECK_2_REJECTED.value
        }
      }
      return knex('IntSchema.Claim')
        .where('ClaimId', claim.ClaimId)
        .update(updateObject)
        .then(function () {
          return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, event, null, checkResponse.comments, caseworker, true)
        })
    })
}
