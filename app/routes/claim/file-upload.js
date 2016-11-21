const DocumentTypeEnum = require('../../constants/document-type-enum')
const DirectoryCheck = require('../../services/directory-check')
const Upload = require('../../services/upload')
const ValidationError = require('../../services/errors/validation-error')
const ERROR_MESSAGES = require('../../services/validators/validation-error-messages')
const FileUpload = require('../../services/domain/file-upload')
const ClaimDocumentUpdate = require('../../services/data/update-file-upload-details-for-claim')
const csrfProtection = require('csurf')({ cookie: true })
const generateCSRFToken = require('../../services/generate-csrf-token')
var csrfToken

module.exports = function (router) {
  router.get('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res) {
    csrfToken = generateCSRFToken(req)

    if (DocumentTypeEnum.hasOwnProperty(req.params.documentType)) {
      DirectoryCheck(`${req.params.referenceId}-${req.query.eligibilityId}`, req.params.claimId, req.query.claimExpenseId, req.params.documentType)
      return res.render('claim/file-upload', {
        claimType: req.params.claimType,
        document: req.params.documentType,
        fileUploadGuidingText: DocumentTypeEnum,
        URL: req.url
      })
    } else {
      throw new Error('Not a valid document type')
    }
  })

  router.post('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res, next) {
    Upload(req, res, function (error) {
      try {
        // If there was no file attached, we still need to check the CSRF token
        if (!req.file) {
          csrfProtection(req, res, function (error) {
            if (error) { throw error }
          })
        }
        if (error) {
          throw new ValidationError({upload: [ERROR_MESSAGES.getUploadTooLarge]})
        } else {
          if (DocumentTypeEnum.hasOwnProperty(req.params.documentType)) {
            var fileUpload = new FileUpload(req.file, req.error, req.query.claimDocumentId, req.user.email)
            ClaimDocumentUpdate(req.params.referenceId, fileUpload).then(function () {
              res.redirect(`/claim/${req.params.claimId}`)
            }).catch(function (error) {
              next(error)
            })
          } else {
            throw new Error('Not a valid document type')
          }
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          return res.status(400).render('claim/file-upload', {
            errors: error.validationErrors,
            claimType: req.params.claimType,
            document: req.params.documentType,
            fileUploadGuidingText: DocumentTypeEnum,
            URL: req.url,
            csrfToken: csrfToken
          })
        } else {
          next(error)
        }
      }
    })
  })
}
