const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')

class OverpaymentResponse {
  constructor (isOverpaid, amount, reason) {
    this.isOverpaid = isOverpaid
    this.amount = amount
    this.reason = reason
    this.IsValid()
  }

  IsValid () {
    var errors = ErrorHandler()

    if (this.isOverpaid) {
      FieldValidator(this.amount, 'overpayment-amount', errors)
      .isRequired()
      .isGreaterThanZero()
      .isCurrency()
    }

    var validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = OverpaymentResponse