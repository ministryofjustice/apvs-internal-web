const { getDatabaseConnector } = require('../../databaseConnector')
const claimEventEnum = require('../../constants/claim-event-enum')
const closedClaimStatusMap = require('../../constants/closed-claim-status-map')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  var claimEvents = [
    claimEventEnum.REQUEST_NEW_BANK_DETAILS.value,
    claimEventEnum.PAYOUT_BARCODE_EXPIRED.value,
    claimEventEnum.PAYMENT_REISSUED.value,
    claimEventEnum.CLAIM_APPROVED.value,
    claimEventEnum.CLAIM_AUTO_APPROVED.value,
    claimEventEnum.CLAIM_REJECTED.value,
    claimEventEnum.CLAIM_UPDATED.value
  ]
  const db = getDatabaseConnector()

  return db('ClaimEvent')
    .first('Event')
    .whereIn('Event', claimEvents)
    .andWhere('ClaimId', claimId)
    .orderBy('ClaimEventId', 'desc')
    .then(function (event) {
      if (event) {
        if (event !== null && event !== undefined) {
          return (closedClaimStatusMap[event.Event])
        } else {
          return 'Closed'
        }
      } else {
        return 'Closed'
      }
    })
}
