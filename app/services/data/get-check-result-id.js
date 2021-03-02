const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (decision) {
  console.log(knex('IntSchema.CheckResult')
  .first('CheckResultId')
  .where('CheckResultValue', decision).toString())
  return knex('IntSchema.CheckResult')
    .first('CheckResultId')
    .where('CheckResultValue', decision)
    .then(function (result) {
      if (result) {
        return result.CheckResultId
      } else {
        return null
      }
    })
}
