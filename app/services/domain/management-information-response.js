const ValidationError = require('../errors/validation-error')
const FieldValidator = require('../validators/field-validator')
const ErrorHandler = require('../validators/error-handler')
const dateFormatter = require('../date-formatter')
const ERROR_MESSAGES = require('../validators/validation-error-messages')

class ManagementInformationResponse {
  constructor (metric, fromDay, fromMonth, fromYear, toDay, toMonth, toYear, breakdownBy, year, month, quarter, week, country, pendingReason) {
    this.metric = metric
    this.fromDay = fromDay
    this.fromMonth = fromMonth
    this.fromYear = fromYear
    this.toDay = toDay
    this.toMonth = toMonth
    this.toYear = toYear
    this.breakdownBy = breakdownBy
    this.year = year
    this.month = month
    this.quarter = quarter
    this.week = week
    this.country = country
    this.pendingReason = pendingReason

    this.fromDateFields = [
      fromDay,
      fromMonth,
      fromYear
    ]
    this.fromDate = dateFormatter.build(fromDay, fromMonth, fromYear)

    this.toDateFields = [
      toDay,
      toMonth,
      toYear
    ]
    this.toDate = dateFormatter.build(toDay, toMonth, toYear)
    this.IsValid()
  }

  IsValid () {
    const errors = ErrorHandler()

    FieldValidator(this.metric, 'metric', errors)
      .isRequired()

    FieldValidator(this.fromDateFields, 'from', errors)
      .isDateRequired(ERROR_MESSAGES.getFromDateIsRequired)
      .isValidDate(this.fromDate)

    FieldValidator(this.toDateFields, 'to', errors)
      .isDateRequired(ERROR_MESSAGES.getToDateIsRequired)
      .isValidDate(this.toDate)

    FieldValidator(this.breakdownBy, 'breakdownBy', errors)
      .isRequired(ERROR_MESSAGES.getBreakdownByIsRequired)

    if (this.breakdownBy === 'year') {
      FieldValidator(this.year, 'year', errors)
        .isRequired()
    }

    if (this.breakdownBy === 'month') {
      FieldValidator(this.month, 'month', errors)
        .isRequired()
    }

    if (this.breakdownBy === 'quarter') {
      FieldValidator(this.quarter, 'quarter', errors)
        .isRequired()
    }

    if (this.breakdownBy === 'week') {
      FieldValidator(this.quarter, 'week', errors)
        .isRequired()
    }

    FieldValidator(this.country, 'country', errors)
      .isRequired()

    if (this.metric === 'pending') {
      FieldValidator(this.pendingReason, 'pendingReason', errors)
        .isRequired()
    }

    const validationErrors = errors.get()

    if (validationErrors) {
      throw new ValidationError(validationErrors)
    }
  }
}

module.exports = ManagementInformationResponse
