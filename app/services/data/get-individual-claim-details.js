const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const duplicateClaimCheck = require('./duplicate-claim-check')
const moment = require('moment')

module.exports = function (claimId) {
  var claimDetails

  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.ClaimId', claimId)
    .first(
      'Eligibility.Reference',
      'Eligibility.EligibilityId',
      'Claim.ClaimId',
      'Claim.ClaimType',
      'Claim.IsAdvanceClaim',
      'Claim.DateSubmitted',
      'Claim.DateOfJourney',
      'Claim.AssistedDigitalCaseworker',
      'Claim.Caseworker',
      'Visitor.FirstName',
      'Visitor.LastName',
      'Visitor.DateOfBirth',
      'Visitor.NationalInsuranceNumber',
      'Visitor.HouseNumberAndStreet',
      'Visitor.Town',
      'Visitor.County',
      'Visitor.PostCode',
      'Visitor.EmailAddress',
      'Visitor.PhoneNumber',
      'Visitor.Relationship',
      'Visitor.Benefit',
      'Visitor.DWPBenefitCheckerResult',
      'Visitor.DWPCheck',
      'Prisoner.FirstName AS PrisonerFirstName',
      'Prisoner.LastName AS PrisonerLastName',
      'Prisoner.DateOfBirth AS PrisonerDateOfBirth',
      'Prisoner.PrisonNumber',
      'Prisoner.NameOfPrison',
      'Prisoner.NomisCheck',
      'Claim.VisitConfirmationCheck',
      'Claim.LastUpdated')
    .then(function (claim) {
      claim.lastUpdatedHidden = moment(claim.LastUpdated)
      return knex('ClaimDocument')
        .where({'ClaimDocument.ClaimId': claimId, 'ClaimDocument.IsEnabled': true, 'ClaimDocument.ClaimExpenseId': null})
        .select(
          'ClaimDocument.ClaimDocumentId',
          'ClaimDocument.DocumentStatus',
          'ClaimDocument.Filepath',
          'ClaimDocument.DocumentType')
        .orderBy('ClaimDocument.DateSubmitted', 'desc')
        .then(function (claimDocuments) {
          claim.benefitDocument = []
          claimDocuments.forEach(function (document) {
            if (document.DocumentType === 'VISIT-CONFIRMATION') {
              claim.visitConfirmation = document
            } else {
              claim.benefitDocument.push(document)
            }
          })
          return knex('Claim')
            .join('ClaimExpense', 'Claim.ClaimId', '=', 'ClaimExpense.ClaimId')
            .where('Claim.ClaimId', claimId)
            .select('ClaimExpense.*', 'ClaimDocument.DocumentStatus', 'ClaimDocument.DocumentType', 'ClaimDocument.ClaimDocumentId', 'ClaimDocument.Filepath')
            .leftJoin('ClaimDocument', function () {
              this
                .on('ClaimExpense.ClaimId', 'ClaimDocument.ClaimId')
                .on('ClaimExpense.ClaimExpenseId', 'ClaimDocument.ClaimExpenseId')
                .on('ClaimExpense.IsEnabled', 'ClaimDocument.IsEnabled')
            })
            .orderBy('ClaimExpense.ClaimExpenseId')
            .then(function (claimExpenses) {
              var total = 0
              claimExpenses.forEach(function (expense) {
                total += expense.Cost
                expense.Cost = Number(expense.Cost).toFixed(2)
                if (expense.ApprovedCost !== null) {
                  expense.ApprovedCost = Number(expense.ApprovedCost).toFixed(2)
                }
                if (expense.ExpenseType === 'car' && expense.Status === null) {
                  expense.Status = 'APPROVED-DIFF-AMOUNT'
                }
              })
              claim.Total = Number(total).toFixed(2)
              return claimExpenses
            })
            .then(function (claimExpenses) {
              return knex('Claim')
                .join('ClaimChild', 'Claim.ClaimId', '=', 'ClaimChild.ClaimId')
                .where({ 'Claim.ClaimId': claimId, 'ClaimChild.IsEnabled': true })
                .select()
                .orderBy('ClaimChild.Name')
                .then(function (claimChild) {
                  claimDetails = {
                    claim: claim,
                    claimExpenses: claimExpenses,
                    claimChild: claimChild
                  }

                  return duplicateClaimCheck(claimId, claimDetails.claim.NationalInsuranceNumber, claimDetails.claim.PrisonNumber, claimDetails.claim.DateOfJourney)
                })
                .then(function (result) {
                  claimDetails.duplicates = result

                  return knex('ClaimEvent')
                    .where('ClaimId', claimId)
                    .then(function (claimEvents) {
                      claimDetails.claimEvents = claimEvents

                      return claimDetails
                    })
                })
            })
        })
    })
}
