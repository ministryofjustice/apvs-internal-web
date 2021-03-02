const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (Check1ResultId, Check2ResultId) {
  var checkResults = {}
  return knex('IntSchema.CheckResult')
    .first('CheckResultValue AS Check1Result')
    .where('CheckResultId', Check1ResultId)
    .then(function (result1) {
      if (result1) {
        checkResults.Check1Result = result1.Check1Result
      } else {
        checkResults.Check1Result = null
      }
      return knex('IntSchema.CheckResult')
        .first('CheckResultValue AS Check2Result')
        .where('CheckResultId', Check2ResultId)
        .then(function (result2) {
          if (result2) {
            checkResults.Check2Result = result2.Check2Result
          } else {
            checkResults.Check2Result = null
          }
          return checkResults
        })
    })
}
