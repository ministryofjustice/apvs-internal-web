const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const ERROR_MESSAGES = require('../validators/validation-error-messages')
const claimDecisionEnum = require('../../constants/claim-decision-enum')

var noteId

class ClaimDecision {
  constructor (caseworker,
               assistedDigitalCaseworker,
               decision,
               additionalInfoApprove,
               additionalInfoRequest,
               additionalInfoReject,
               nomisCheck,
               dwpCheck,
               visitConfirmationCheck,
               claimExpenseResponses,
               claimDeductionResponses,
               isAdvanceClaim) {
    this.caseworker = caseworker
    this.assistedDigitalCaseworker = assistedDigitalCaseworker

    this.decision = decision
    if (this.decision === claimDecisionEnum.APPROVED) {
      this.note = additionalInfoApprove
      noteId = 'additional-info-approve'
    } else if (decision === claimDecisionEnum.REJECTED) {
      this.note = additionalInfoReject
      noteId = 'additional-info-reject'
    } else {
      this.note = additionalInfoRequest
      noteId = 'additional-info-request'
    }
    this.nomisCheck = nomisCheck
    this.dwpCheck = dwpCheck
    this.visitConfirmationCheck = visitConfirmationCheck

    this.claimExpenseResponses = claimExpenseResponses
    claimExpenseResponses.forEach(function (expense) {
      if (expense.status === claimDecisionEnum.APPROVED) {
        expense.approvedCost = Number(expense.cost).toFixed(2)
      } else if (expense.status !== claimDecisionEnum.APPROVED_DIFF_AMOUNT) {
        expense.approvedCost = null
      }
    })
    this.claimDeductionResponses = claimDeductionResponses
    this.isAdvanceClaim = isAdvanceClaim
    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    if (this.caseworker === this.assistedDigitalCaseworker) {
      throw new ValidationError({'assisted-digital-caseworker': [ERROR_MESSAGES.getAssistedDigitalCaseworkerSameClaim]})
    }

    FieldValidator(this.decision, 'decision', errors)
      .isRequired()

    if (this.decision !== claimDecisionEnum.APPROVED) {
      FieldValidator(this.note, noteId, errors)
        .isRequired(ERROR_MESSAGES.getAdditionalInformationRequired)
    }

    this.claimExpenseResponses.forEach(function (expense) {
      FieldValidator(expense.status, 'claim-expenses', errors)
        .isRequired(ERROR_MESSAGES.getExpenseCheckRequired)

      if (expense.approvedCost != null) {
        FieldValidator(expense.approvedCost, 'approve-cost', errors)
          .isRequired()
          .isCurrency()
          .isGreaterThanZero()
          .isLessThanMaximumDifferentApprovedAmount()
      }
    })

    var totalExpenseCost = 0.00
    var allExpensesRejected = true
    this.claimExpenseResponses.forEach(function (expense) {
      if (expense.status !== claimDecisionEnum.REJECTED) {
        allExpensesRejected = false
      }
      totalExpenseCost += parseFloat(expense.approvedCost)
    })

    if (this.decision === claimDecisionEnum.APPROVED && allExpensesRejected) {
      errors.add('claim-expenses', ERROR_MESSAGES.getNonRejectedClaimExpenseResponse)
    }

    var totalDeductionCost = 0.00
    this.claimDeductionResponses.forEach(function (deduction) {
      totalDeductionCost += parseFloat(deduction.Amount)
    })

    var total = 0.00
    total = totalExpenseCost - totalDeductionCost

    FieldValidator(total, 'total-approved-cost', errors)
      .isGreaterThanMinimumClaim()

    FieldValidator(this.nomisCheck, 'nomis-check', errors)
      .isRequired(ERROR_MESSAGES.getPrisonerCheckRequired)

    FieldValidator(this.dwpCheck, 'dwp-check', errors)
      .isRequired(ERROR_MESSAGES.getBenefitCheckRequired)

    if (!this.isAdvanceClaim) {
      FieldValidator(this.visitConfirmationCheck, 'visit-confirmation-check', errors)
        .isRequired(ERROR_MESSAGES.getVisitConfirmationRequired)
    }

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ClaimDecision
