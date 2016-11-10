var expect = require('chai').expect
var claimExpenseHelper = require('../../../../app/views/helpers/claim-expense-helper')

describe('views/claim-expense-helper', function () {
  describe('FormattedDetail', function () {
    const FROM = 'PointA'
    const TO = 'PointB'
    const DURATION_OF_TRAVEL = '2'
    const TICKET_TYPE = 'foot-passenger'

    const CHILD_PREFIX = 'Child - '
    const RETURN_POSTFIX = ' - Return'

    it('should return formatted detail string for ClaimExpense', function () {
      expect(claimExpenseHelper({ ExpenseType: 'car hire', From: FROM, To: TO, DurationOfTravel: 2 }))
        .to.equal(`${FROM} to ${TO} for ${DURATION_OF_TRAVEL} days`)

      expect(claimExpenseHelper({ ExpenseType: 'bus', From: FROM, To: TO }))
        .to.equal(`${FROM} to ${TO}`)

      expect(claimExpenseHelper({ ExpenseType: 'train', From: FROM, To: TO }))
        .to.equal(`${FROM} to ${TO}`)

      expect(claimExpenseHelper({ ExpenseType: 'light refreshment', TravelTime: 'over-five' }))
        .to.equal('Over five hours away but under ten hours')

      expect(claimExpenseHelper({ ExpenseType: 'light refreshment', TravelTime: 'over-ten' }))
        .to.equal('Over ten hours away')

      expect(claimExpenseHelper({ ExpenseType: 'accommodation', DurationOfTravel: DURATION_OF_TRAVEL }))
        .to.equal(`Nights stayed: ${DURATION_OF_TRAVEL}`)

      expect(claimExpenseHelper({ ExpenseType: 'ferry', From: FROM, To: TO, TicketType: TICKET_TYPE }))
        .to.equal(`${FROM} to ${TO} as a foot passenger`)

      expect(claimExpenseHelper({ ExpenseType: 'anything-else', From: FROM, To: TO }))
        .to.equal(`${FROM} to ${TO}`)
    })

    it('should prepend child prefix for bus, train, plane, and ferry expenses', function () {
      expect(claimExpenseHelper({ ExpenseType: 'bus', From: FROM, To: TO, IsChild: true }))
        .to.equal(`${CHILD_PREFIX}${FROM} to ${TO}`)

      expect(claimExpenseHelper({ ExpenseType: 'train', From: FROM, To: TO, IsChild: true }))
        .to.equal(`${CHILD_PREFIX}${FROM} to ${TO}`)

      expect(claimExpenseHelper({ ExpenseType: 'plane', From: FROM, To: TO, IsChild: true }))
        .to.equal(`${CHILD_PREFIX}${FROM} to ${TO}`)

      expect(claimExpenseHelper({ ExpenseType: 'ferry', From: FROM, To: TO, IsChild: true, TicketType: TICKET_TYPE }))
        .to.equal(`${CHILD_PREFIX}${FROM} to ${TO} as a foot passenger`)
    })

    it('should append return postfix for bus, train, plane, and ferry expenses', function () {
      expect(claimExpenseHelper({ ExpenseType: 'bus', From: FROM, To: TO, IsReturn: true }))
        .to.equal(`${FROM} to ${TO}${RETURN_POSTFIX}`)

      expect(claimExpenseHelper({ ExpenseType: 'train', From: FROM, To: TO, IsReturn: true }))
        .to.equal(`${FROM} to ${TO}${RETURN_POSTFIX}`)

      expect(claimExpenseHelper({ ExpenseType: 'plane', From: FROM, To: TO, IsReturn: true }))
        .to.equal(`${FROM} to ${TO}${RETURN_POSTFIX}`)

      expect(claimExpenseHelper({ ExpenseType: 'ferry', From: FROM, To: TO, IsReturn: true, TicketType: TICKET_TYPE }))
        .to.equal(`${FROM} to ${TO} as a foot passenger${RETURN_POSTFIX}`)
    })
  })
})
