const authorisation = require('../services/authorisation')
const getDashboardData = require('../services/data/dashboard/get-dashboard-data')
const dashboardFilterEnum = require('../constants/dashboard-filter-enum')
const dateFormatter = require('../services/date-formatter')
const ValidationError = require('../services/errors/validation-error')
const log = require('../services/log')
const getClaimListForManagementInformation = require('../services/data/get-claim-list-for-management-information')
const ManagementInformationResponse = require('../services/domain/management-information-response')

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

  router.post('/management-information', function (req, res) {
    authorisation.isCaseworker(req)

    try {
      const managementInformationResponse = new ManagementInformationResponse(
        req.body.metric,
        req.body.fromDay,
        req.body.fromMonth,
        req.body.fromYear,
        req.body.toDay,
        req.body.toMonth,
        req.body.toYear,
        req.body.breakdownBy,
        req.body.year,
        req.body.month,
        req.body.quarter,
        req.body.week,
        req.body.country
      )
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.render('management-information', {
          errors: error.validationErrors,
          query: req.body,
          stringifiedBody: '',
          startSearching: false
        })
      } else {
        throw error
      }
    }
    let stringifiedBody = Object.assign({}, req.body)
    stringifiedBody = JSON.stringify(stringifiedBody)
    return res.render('management-information', {
      query: req.body,
      stringifiedBody: stringifiedBody,
      startSearching: true
    })
  })

  router.post('/management-information/search', function (req, res, next) {
    authorisation.isCaseworker(req)
    // TODO Add Validation

    return getClaimListForManagementInformation(req.body, parseInt(req.body.start), parseInt(req.body.length))
    .then(function (data) {
      const claims = data.claims
      if (claims.length === 0) {
        return res.json({
          draw: 0,
          recordsTotal: 0,
          recordsFiltered: 0,
          claims: claims
        })
      }

      return res.json({
        draw: req.body.draw,
        recordsTotal: data.total.Count,
        recordsFiltered: data.total.Count,
        claims: claims
      })
    }).catch(function (error) {
      next(error)
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
