const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const dateFormatter = require('../date-formatter')
const statusFormatter = require('../claim-status-formatter')
const claimStatusEnum = require('../../constants/claim-status-enum')
const Promise = require('bluebird').Promise
const getClosedClaimStatus = require('./get-closed-claim-status')
const log = require('../log')

module.exports = function (query, offset, limit) {
  // query = `%${query}%` // wrap in % for where clause

  // Ref no.	Claimant Name	Caseworker	Date Received	Claim No.	Paid / Rejected
  // breakdownBy=year, year=2017, country=any
  const startAndEndDates = query[query.breakdownBy].split(',')

  if (startAndEndDates.length !== 2) {
    throw new error('Invaid dates received')
  }

  const startDate = moment(startAndEndDates[0])
  const endDate = moment(startAndEndDates[1])

  if (endDate.isBefore(startDate)) {
    throw new error('Invaid dates received')
  }

  let country
  if (query.country === 'any') {
    country = ['england', 'scotland', 'wales', 'northern ireland']
  } else {
    country = [query.country]
  }

  let columns = []
  let dateField
  let knexQuery
  let knexCountQuery
  let pendingReason
  if (query.metric === 'received') {
    columns = ['Claim.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.Caseworker AS AssignedTo', 'Claim.DateSubmitted', 'Claim.ClaimId', 'Claim.Status']
    dateField = 'Claim.DateSubmitted'

    knexCountQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .where(dateField, '>=', startDate.format('YYYY-MM-DD'))
      .where(dateField, '<=', endDate.format('YYYY-MM-DD'))
      .whereIn('Visitor.Country', country)
      .count('Claim.ClaimId AS Count')

    knexQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .where(dateField, '>=', startDate.format('YYYY-MM-DD'))
      .where(dateField, '<=', endDate.format('YYYY-MM-DD'))
      .whereIn('Visitor.Country', country)
      .columns(columns)
      .orderBy('Claim.DateSubmitted', 'asc')
      .offset(offset)
  } else if (query.metric === 'pending') {
    if (query.pendingReason === 'informationRequested') {
      pendingReason = claimStatusEnum.REQUEST_INFORMATION.value
    } else if (query.pendingReason === 'incompleteInformation') {
      pendingReason = claimStatusEnum.PENDING.value
    } else if (query.pendingReason === 'paymentInformationRequested') {
      pendingReason = claimStatusEnum.REQUEST_INFO_PAYMENT.value
    } else {
      throw new error('Invalid pending reason received')
    }

    columns = ['Claim.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.Caseworker AS AssignedTo', 'Claim.DateSubmitted', 'Claim.ClaimId', 'Claim.Status']
    dateField = 'Claim.LastUpdated'

    knexCountQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .where(dateField, '>=', startDate.format('YYYY-MM-DD'))
      .where(dateField, '<=', endDate.format('YYYY-MM-DD'))
      .where('Claim.Status', pendingReason)
      .whereIn('Visitor.Country', country)
      .count('Claim.ClaimId AS Count')

    knexQuery = knex('Claim')
      .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
      .where(dateField, '>=', startDate.format('YYYY-MM-DD'))
      .where(dateField, '<=', endDate.format('YYYY-MM-DD'))
      .where('Claim.Status', pendingReason)
      .whereIn('Visitor.Country', country)
      .columns(columns)
      .orderBy('Claim.DateSubmitted', 'asc')
      .offset(offset)
  }

  return knexCountQuery
    .then(function (count) {
      return knexQuery
        .then(function (claims) {
          var claimsToReturn = []
          return Promise.each(claims, function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.DisplayStatus = statusFormatter(claim.Status)
            claim.Claimant = claim.FirstName + ' ' + claim.LastName
            if (claim.AssignedTo && claim.AssignmentExpiry < dateFormatter.now().toDate()) {
              claim.AssignedTo = null
            }
            claim.AssignedTo = !claim.AssignedTo ? 'Unassigned' : claim.AssignedTo
            if (claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED.value) {
              return getClosedClaimStatus(claim.ClaimId)
                .then(function (status) {
                  claim.DisplayStatus = 'Closed - ' + statusFormatter(status)
                  claimsToReturn.push(claim)
                })
            } else {
              claimsToReturn.push(claim)
              return Promise.resolve()
            }
          })
            .then(function () {
              return { claims: claimsToReturn.slice(0, limit), total: count[0] }
            })
        })
    })
}
