const displayFieldNames = require('./display-field-names')
const ticketOwnerEnum = require('../../constants/ticket-owner-enum')
const displayHelper = require('./display-helper')

module.exports = function (expense) {
  var formattedDetail

  switch (expense.ExpenseType) {
    case 'hire':
      formattedDetail = `${expense.From} to ${expense.To} for ${expense.DurationOfTravel} days`
      break
    case 'bus':
    case 'plane':
    case 'train':
      formattedDetail = `${addTicketOwnerPrefix(expense)}${expense.From} to ${expense.To}${addReturnPostfix(expense)}`
      break
    case 'refreshment':
      formattedDetail = ''
      break
    case 'accommodation':
      formattedDetail = `Nights stayed: ${expense.DurationOfTravel}`
      break
    case 'ferry':
      formattedDetail = `${addTicketOwnerPrefix(expense)}${expense.From} to ${expense.To} as ${displayFieldNames[expense.TicketType]}${addReturnPostfix(expense)}`
      break
    case 'car':
      formattedDetail = `${expense.From} to ${displayHelper.getPrisonDisplayName(expense.To)}`
      if (expense.FromPostCode && expense.ToPostCode) {
        formattedDetail = `${expense.From} <span class="bold">${expense.FromPostCode}</span> to ${displayHelper.getPrisonDisplayName(expense.To)} <span class="bold">${expense.ToPostCode}</span><br>Return Journey `
        if (expense.Distance) {
          formattedDetail += `(${expense.Distance} miles)`
        }
      }
      break
    case 'toll':
    case 'parking':
      formattedDetail = `${expense.From} to ${displayHelper.getPrisonDisplayName(expense.To)}`
      break
    default:
      formattedDetail = `${expense.From} to ${expense.To}`
  }

  return formattedDetail
}

function addTicketOwnerPrefix (expense) {
  var result = ''

  for (var ticketOwner in ticketOwnerEnum) {
    if (ticketOwnerEnum[ticketOwner].value === expense.TicketOwner) {
      result = ticketOwnerEnum[ticketOwner].displayValue + ' - '
    }
  }

  return result
}

function addReturnPostfix (expense) {
  if (expense.IsReturn) {
    return ' - Return'
  } else {
    return ''
  }
}
