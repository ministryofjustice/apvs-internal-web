exports.up = function (knex, Promise) {
  return knex.schema.createTable('Visitor', function (table) {
    table.integer('VisitorId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.string('Title', 10).notNullable()
    table.string('FirstName', 100).notNullable()
    table.string('LastName', 100).notNullable()
    table.string('NationalInsuranceNumber', 10).notNullable()
    table.string('HouseNumberAndStreet', 250).notNullable()
    table.string('Town', 100).notNullable()
    table.string('County', 100).notNullable()
    table.string('PostCode', 10).notNullable()
    table.string('Country', 100).notNullable()
    table.string('EmailAddress', 100).notNullable()
    table.string('PhoneNumber', 100)
    table.dateTime('DateOfBirth').notNullable()
    table.string('Relationship', 100).notNullable()
    table.string('Benefit', 100)
    table.string('DWPBenefitCheckerResult', 100)
    table.string('DWPCheck', 20)
  })
  .then(function () {
    return knex.schema.alterTable('Visitor', function (table) {
      table.foreign(['EligibilityId', 'Reference']).references(['Eligibility.EligibilityId', 'Eligibility.Reference'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Visitor')
}
