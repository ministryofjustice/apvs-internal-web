const authorisation = require('../services/authorisation')
const getClaimsListAndCount = require('../services/data/get-claim-list-and-count')
const claimStatusEnum = require('../constants/claim-status-enum')
const displayHelper = require('../views/helpers/display-helper')

module.exports = function (router) {
  router.get('/', function (req, res) {
    authorisation.isCaseworker(req)

    res.render('index', {
      title: 'APVS index',
      active: req.query.status
    })
  })

  router.get('/claims/:status', function (req, res) {
    authorisation.isCaseworker(req)

    var sortType
    var sortOrder

    if (req.query.order) {
      switch (req.query.order[0].column) {
        case '2':
          sortType = 'Claim.DateSubmitted'
          sortOrder = req.query.order[0].dir
          break
        case '3':
          sortType = 'Claim.DateOfJourney'
          sortOrder = req.query.order[0].dir
          break
        case '4':
          sortType = 'Claim.LastUpdated'
          sortOrder = req.query.order[0].dir
          break
        default:
          sortType = 'Claim.DateSubmitted'
          sortOrder = 'asc'
      }
    } else {
      sortType = 'Claim.DateSubmitted'
      sortOrder = 'asc'
    }

    var advanceClaims = false
    var status = req.params.status
    if (status === 'ADVANCE') {
      advanceClaims = true
      status = [claimStatusEnum.NEW.value]
    } else if (status === 'ADVANCE-APPROVED') {
      advanceClaims = true
      status = [claimStatusEnum.APPROVED.value]
    } else if (status === 'ADVANCE-UPDATED') {
      advanceClaims = true
      status = [claimStatusEnum.UPDATED.value]
    } else if (status === 'PENDING') {
      advanceClaims = false
      status = [claimStatusEnum.PENDING.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value]
    } else if (status === 'ADVANCE-PENDING-INFORMATION') {
      advanceClaims = true
      status = [claimStatusEnum.PENDING.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value]
    } else {
      status = [status]
    }

    getClaimsListAndCount(status, advanceClaims, parseInt(req.query.start), parseInt(req.query.length), req.user.email, sortType, sortOrder)
      .then(function (data) {
        var claims = data.claims
        claims.map(function (claim) {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
        })

        return res.json({
          draw: req.query.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims: claims
        })
      })
      .catch(function (error) {
        res.status(500).send(error)
      })
  })

  router.get('/claims/:status/:sortType', function (req, res) {
    authorisation.isCaseworker(req)

    var sortType
    var sortOrder = 'desc'

    if (req.query.order) {
      switch (req.query.order[0].column) {
        case '2':
          sortType = 'Claim.DateSubmitted'
          sortOrder = req.query.order[0].dir
          break
        case '3':
          sortType = 'Claim.DateOfJourney'
          sortOrder = req.query.order[0].dir
          break
        case '4':
          sortType = 'Claim.LastUpdated'
          sortOrder = req.query.order[0].dir
          break
        default:
          sortType = 'Claim.DateSubmitted'
          sortOrder = 'asc'
      }
    } else if (req.params.sortType === 'updated') {
      sortType = 'Claim.LastUpdated'
    } else if (req.params.sortType === 'visit') {
      sortType = 'Claim.DateOfJourney'
    } else {
      sortType = 'Claim.DateSubmitted'
    }

    var advanceClaims = false
    var status = req.params.status
    if (status === 'ADVANCE') {
      advanceClaims = true
      status = [claimStatusEnum.NEW.value]
    } else if (status === 'ADVANCE-APPROVED') {
      advanceClaims = true
      status = [claimStatusEnum.APPROVED.value]
    } else if (status === 'ADVANCE-UPDATED') {
      advanceClaims = true
      status = [claimStatusEnum.UPDATED.value]
    } else if (status === 'PENDING') {
      advanceClaims = false
      status = [claimStatusEnum.PENDING.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value]
    } else if (status === 'ADVANCE-PENDING-INFORMATION') {
      advanceClaims = true
      status = [claimStatusEnum.PENDING.value, claimStatusEnum.REQUEST_INFORMATION.value, claimStatusEnum.REQUEST_INFO_PAYMENT.value]
    } else {
      status = [status]
    }

    getClaimsListAndCount(status, advanceClaims, parseInt(req.query.start), parseInt(req.query.length), req.user.email, sortType, sortOrder)
      .then(function (data) {
        var claims = data.claims
        claims.map(function (claim) {
          claim.ClaimTypeDisplayName = displayHelper.getClaimTypeDisplayName(claim.ClaimType)
        })

        return res.json({
          draw: req.query.draw,
          recordsTotal: data.total.Count,
          recordsFiltered: data.total.Count,
          claims: claims
        })
      })
      .catch(function (error) {
        res.status(500).send(error)
      })
  })
}
