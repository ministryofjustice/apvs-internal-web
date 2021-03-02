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
    return databaseHelper.insertTestData(reference, date, 'APPROVED', undefined, undefined, 'PROCESSED').then(function (ids) {
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

  it('should approve the first post-approval check', async () => {
    await browser.url('/')

    await browser.url('/claim/' + claimId)

    // View-claim
    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    let check1Label = await $('#check-1-label')
    await check1Label.click()

    let check2Label
    let exists
    try {
      check2Label = await $('#check-2-label')
      exists = await check2Label.isExisting()
      expect(exists, 'Check 2 should be not available while Check 1 is still pending').to.equal(false)
    } catch (error) {
      log.error(error)
    }

    const checkDecision = await $('#check-decision')
    await checkDecision.selectByVisibleText('Approve')

    const checkComments = await $('#check-comments')
    await checkComments.setValue('Testing')

    const submitButton = await $('#complete-check-1')
    await submitButton.click()

    try {
      check1Label = await $('#check-1-label')
      exists = await check1Label.isExisting()
      expect(exists, 'Check 1 should not be available after check 1 has been Approved').to.equal(false)
    } catch (error) {
      log.error(error)
    }

    check2Label = await $('#check-2-label')
    exists = await check2Label.isExisting()
    expect(exists, 'Check 2 should be available after Check 1 is approved').to.equal(true)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
