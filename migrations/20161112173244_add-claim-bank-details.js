exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimBankDetail', function (table) {
    table.integer('ClaimBankDetailId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.string('AccountNumber', 8)
    table.string('SortCode', 6)
  })
  .then(function () {
    return knex.schema.alterTable('ClaimBankDetail', function (table) {
      table.foreign(['ClaimId', 'EligibilityId', 'Reference']).references(['Claim.ClaimId', 'Claim.EligibilityId', 'Claim.Reference'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimBankDetail')
}
