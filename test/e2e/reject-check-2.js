const config = require('../../config')
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const expect = require('chai').expect

// Variables for creating and deleting a record
const reference = '1111111'
let date
let claimId
const log = require('../../app/services/log')

describe('Adding a new top up flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'APPROVED', undefined, undefined, 'PROCESSED', 1, null).then(function (ids) {
      claimId = ids.claimId
    })
      .then(async () => {
      // IF SSO ENABLED LOGIN TO SSO
        if (config.AUTHENTICATION_ENABLED === 'true') {
          await browser.url(config.TOKEN_HOST)
          const email = await $('#user_email')
          const password = await $('#user_password')
          const commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('should reject the second post-approval check', async () => {
    await browser.url('/')

    await browser.url('/claim/' + claimId)

    // View-claim
    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    let check1Label
    let exists
    try {
      check1Label = await $('#check-1-label')
      exists = await check1Label.isExisting()
      expect(exists, 'Check 1 should be not available after it has been approved').to.equal(false)
    } catch (error) {
      log.error(error)
    }

    let check2Label = await $('#check-2-label')
    await check2Label.click()

    let checkDecision = await $('#check-decision2')
    await checkDecision.selectByVisibleText('Reject')

    let checkComments = await $('#check-comments2')
    await checkComments.setValue('Testing')

    let submitButton = await $('#complete-check-2')
    await submitButton.click()

    try {
      check1Label = await $('#check-1-label')
      exists = await check1Label.isExisting()
      expect(exists, 'Check 1 should not be available after check 2 has been Rejected').to.equal(false)
    } catch (error) {
      log.error(error)
    }

    try {
      check2Label = await $('#check-2-label')
      exists = await check2Label.isExisting()
      expect(exists, 'Check 2 should not be available after check 2 has been Rejected').to.equal(false)
    } catch (error) {
      log.error(error)
    }
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
