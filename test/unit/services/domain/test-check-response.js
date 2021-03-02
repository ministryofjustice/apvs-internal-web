const CheckResponse = require('../../../../app/services/domain/check-response')
const ValidationError = require('../../../../app/services/errors/validation-error')
const expect = require('chai').expect
let check

describe('services/domain/topup-response', function () {
  const APPROVED = 'APPROVED'
  const REJECTED = 'REJECTED'
  const COMMENTS = 'This is a test'

  it('should construct a domain object given valid input - APPROVED', function () {
    check = new CheckResponse(APPROVED, COMMENTS)
    expect(check.decision).to.equal(APPROVED)
    expect(check.comments).to.equal(COMMENTS)
  })

  it('should construct a domain object given valid input (empty comments) - APPROVED', function () {
    check = new CheckResponse(APPROVED, '')
    expect(check.decision).to.equal(APPROVED)
    expect(check.comments).to.equal('')
  })

  it('should construct a domain object given valid input - REJECTED', function () {
    check = new CheckResponse(REJECTED, COMMENTS)
    expect(check.decision).to.equal(REJECTED)
    expect(check.comments).to.equal(COMMENTS)
  })

  it('should return isRequired error for decision if decision is empty', function () {
    try {
      check = new CheckResponse('', '')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['check-decision'][0]).to.equal('A Decision is required')
    }
  })

  it('should return isRequired error for comments if decision is REJECTED and comments is empty', function () {
    try {
      check = new CheckResponse(REJECTED, '')
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError)
      expect(e.validationErrors['check-comments'][0]).to.equal('A Reason is required')
    }
  })
})
