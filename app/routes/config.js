const authorisation = require('../services/authorisation')
const getAutoApprovalConfig = require('../services/data/get-auto-approval-config')
const updateAutoApprovalConfig = require('../services/data/update-auto-approval-config')
const autoApprovalRulesEnum = require('../constants/auto-approval-rules-enum')
const AutoApprovalConfig = require('../services/domain/auto-approval-config')
const ValidationError = require('../services/errors/validation-error')

module.exports = function (router) {
  router.get('/config', function (req, res, next) {
    authorisation.isAdmin(req)

    getAutoApprovalConfig()
      .then(function (autoApprovalConfig) {
        var rulesDisabled = autoApprovalConfig.RulesDisabled ? autoApprovalConfig.RulesDisabled : ''
        res.render('config', {
          autoApprovalConfig: autoApprovalConfig,
          autoApprovalRulesEnum: autoApprovalRulesEnum,
          rulesDisabled: rulesDisabled
        })
      })
      .catch(function (error) {
        next(error)
      })
  })

  router.post('/config', function (req, res, next) {
    authorisation.isAdmin(req)

    var rulesDisabled = generateRulesDisabled(req.body.rulesEnabled || [])

    try {
      var autoApprovalConfig = new AutoApprovalConfig(
        req.user.email,
        req.body.AutoApprovalEnabled,
        req.body.CostVariancePercentage,
        req.body.MaxClaimTotal,
        req.body.MaxDaysAfterAPVUVisit,
        req.body.MaxNumberOfClaimsPerYear,
        rulesDisabled
      )

      updateAutoApprovalConfig(autoApprovalConfig)
        .then(function () {
          res.redirect('/config')
        })
        .catch(function (error) {
          next(error)
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).render('config', {
          autoApprovalConfig: req.body,
          autoApprovalRulesEnum: autoApprovalRulesEnum,
          rulesDisabled: rulesDisabled,
          errors: error.validationErrors
        })
      } else {
        next(error)
      }
    }
  })
}

var generateRulesDisabled = function (rulesEnabled) {
  var rules = []

  for (var rule in autoApprovalRulesEnum) {
    rules.push(autoApprovalRulesEnum[rule].value)
  }
  var rulesDisabled = []

  rules.forEach(function (rule) {
    if (rulesEnabled.indexOf(rule) === -1) {
      rulesDisabled.push(rule)
    }
  })

  return rulesDisabled
}
