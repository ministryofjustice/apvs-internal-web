const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const ClaimDecisionEnum = require('../../constants/claim-decision-enum')

class CheckResponse {
  constructor (decision, comments) {
    this.decision = decision
    this.comments = comments

    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    FieldValidator(this.decision, 'check-decision', errors)
      .isRequired()

    if (this.decision === ClaimDecisionEnum.REJECTED) {
      FieldValidator(this.comments, 'check-comments', errors)
        .isLessThanLength(251)
        .isRequired()
    } 

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = CheckResponse
