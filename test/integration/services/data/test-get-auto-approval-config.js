var expect = require('chai').expect
var getAutoApprovalConfig = require('../../../../app/services/data/get-auto-approval-config')
var knexConfig = require('../../../../knexfile').migrations
var knex = require('knex')(knexConfig)
var config = require('../../../../config')
var dateFormatter = require('../../../../app/services/date-formatter')

describe('services/data/get-auto-approval-config', function () {
  var insertedIds

  it('should return auto approval config defaults when no auto approval config data is found', function () {
    return getAutoApprovalConfig()
      .then(function (result) {
        expect(result.AutoApprovalEnabled).to.equal(config.AUTO_APPROVAL_ENABLED === 'true')
        expect(result.CostVariancePercentage).to.equal(parseFloat(config.AUTO_APPROVAL_COST_VARIANCE))
        expect(result.MaxClaimTotal).to.equal(parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL))
        expect(result.MaxDaysAfterAPVUVisit).to.equal(parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT))
        expect(result.MaxNumberOfClaimsPerYear).to.equal(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR))
        expect(result.MaxNumberOfClaimsPerMonth).to.equal(parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH))
        expect(result.RulesDisabled).to.be.null
      })
  })

  it('should return the latest auto approval config record', function () {
    return insertTestData()
      .then(function (result) {
        insertedIds = result
        return getAutoApprovalConfig()
      })
      .then(function (result) {
        expect(result.Caseworker).to.equal('caseworker1@test.com')
        expect(result.RulesDisabled).to.deep.equal(['auto-approval-rule-1', 'auto-approval-rule-2', 'auto-approval-rule-3'])
        expect(result.IsEnabled).to.equal(true)
      })
  })

  after(function () {
    return knex('AutoApprovalConfig')
      .whereIn('AutoApprovalConfigId', insertedIds)
      .del()
  })
})

function insertTestData () {
  return knex('AutoApprovalConfig')
    .insert([{
      Caseworker: 'caseworker1@test.com',
      DateCreated: dateFormatter.now().toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      MaxNumberOfClaimsPerMonth: '2',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-2,auto-approval-rule-3',
      IsEnabled: 'true'
    },
    {
      Caseworker: 'caseworker2@test.com',
      DateCreated: dateFormatter.now().subtract(1, 'day').toDate(),
      AutoApprovalEnabled: 'true',
      CostVariancePercentage: '5.00',
      MaxClaimTotal: '100.00',
      MaxDaysAfterAPVUVisit: '28',
      MaxNumberOfClaimsPerYear: '10',
      MaxNumberOfClaimsPerMonth: '2',
      RulesDisabled: 'auto-approval-rule-1,auto-approval-rule-3',
      IsEnabled: 'false'
    }])
    .returning('AutoApprovalConfigId')
}
