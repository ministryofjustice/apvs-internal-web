const authorisation = require('../services/authorisation')
const getClaimListForSearch = require('../services/data/get-claim-list-for-search')
const displayHelper = require('../views/helpers/display-helper')

module.exports = function (router) {
  router.get('/search', function (req, res) {
    authorisation.isCaseworker(req)
    var query = req.query.q
    return res.render('search', { query: query, startSearching: false })
  })

  router.post('/search', function (req, res) {
    authorisation.isCaseworker(req)
    var query = req.body.q
    var stringifiedBody = Object.assign({}, req.body)
    stringifiedBody = JSON.stringify(stringifiedBody)
    return res.render('search', { query: query, stringifiedBody: stringifiedBody, startSearching: true })
  })

  router.post('/search-results', function (req, res) {
    authorisation.isCaseworker(req)
    var searchQuery = req.body.q || ''

    if (!searchQuery) {
      return res.json({
        draw: 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        claims: []
      })
    } else {
      getClaimListForSearch(searchQuery, parseInt(req.body.start), parseInt(req.body.length))
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
    }
  })
}
