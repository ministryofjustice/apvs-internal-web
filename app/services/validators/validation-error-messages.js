module.exports = {
  getIsRequired: function (displayName) { return `${displayName} is required` },
  getRadioQuestionIsRequired: function (displayName) { return `Select a ${displayName}` },
  getIsNumeric: function (displayName) { return `${displayName} must only contain numbers` },
  getDropboxIsRequired: function (displayName) { return `${displayName} is required` },
  getIsCurrency: function (displayName) { return `${displayName} must be a valid currency` },
  getIsGreaterThan: function (displayName) { return `${displayName} must be greater than zero` },
  getAssistedDigitalCaseworkerSameClaim: 'You cannot process this claim since you filled it in on behalf of a visitor',
  getUploadTooLarge: 'File uploaded too large',
  getUploadIncorrectType: 'File uploaded was not an image or pdf'
}
