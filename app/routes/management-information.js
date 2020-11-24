const authorisation = require('../services/authorisation')
const getDashboardData = require('../services/data/dashboard/get-dashboard-data')
const dashboardFilterEnum = require('../constants/dashboard-filter-enum')
const dateFormatter = require('../services/date-formatter')

module.exports = function (router) {
  router.get('/management-information', function (req, res) {
    authorisation.isCaseworker(req)

    var filter = req.query.filter || dashboardFilterEnum.TODAY

    return getDashboardData(filter)
      .then(function (dashboardData) {
        res.render('management-information', {
          pendingCount: dashboardData.pending,
          inProgressCount: dashboardData.inProgress,
          paidCount: dashboardData.paid,
          autoApprovedCount: dashboardData.autoApproved,
          manuallyApprovedCount: dashboardData.manuallyApproved,
          rejectedCount: dashboardData.rejected,
          filterMonths: getFilterMonths(),
          activeFilter: filter
        })
      })
  })
}

function getFilterMonths () {
  var oneMonthAgo = dateFormatter.now().subtract(1, 'months').format('MMMM')
  var twoMonthsAgo = dateFormatter.now().subtract(2, 'months').format('MMMM')
  var threeMonthsAgo = dateFormatter.now().subtract(3, 'months').format('MMMM')
  var fourMonthsAgo = dateFormatter.now().subtract(4, 'months').format('MMMM')

  return {
    oneMonthAgo: oneMonthAgo,
    twoMonthsAgo: twoMonthsAgo,
    threeMonthsAgo: threeMonthsAgo,
    fourMonthsAgo: fourMonthsAgo
  }
}
