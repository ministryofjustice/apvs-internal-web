module.exports = {
  LOGGING_PATH: process.env.LOGGING_PATH,
  LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'DEBUG',
  LOGSTASH_HOST: process.env.LOGSTASH_HOST,
  LOGSTASH_PORT: process.env.LOGSTASH_PORT,

  // DB
  DATABASE_SERVER: process.env.APVS_DATABASE_SERVER,
  DATABASE: process.env.APVS_DATABASE,
  INT_WEB_USERNAME: process.env.APVS_INT_WEB_USERNAME,
  INT_WEB_PASSWORD: process.env.APVS_INT_WEB_PASSWORD,
  INT_MIGRATION_USERNAME: process.env.APVS_INT_MIGRATION_USERNAME,
  INT_MIGRATION_PASSWORD: process.env.APVS_INT_MIGRATION_PASSWORD,
  EXT_WEB_USERNAME: process.env.APVS_EXT_WEB_USERNAME,

  // MoJ SSO
  AUTHENTICATION_ENABLED: process.env.APVS_MOJ_SSO_AUTHENTICATION_ENABLED || false,
  SESSION_SECRET: process.env.APVS_MOJ_SSO_SESSION_SECRET, // NO DEFAULT FOR SECURITY REASONS, WILL FAIL IF NOT SET
  CLIENT_ID: process.env.APVS_MOJ_SSO_CLIENT_ID,
  CLIENT_SECRET: process.env.APVS_MOJ_SSO_CLIENT_SECRET,
  TOKEN_HOST: process.env.APVS_MOJ_SSO_TOKEN_HOST,
  TOKEN_PATH: process.env.APVS_MOJ_SSO_TOKEN_PATH,
  AUTHORIZE_PATH: process.env.APVS_MOJ_SSO_AUTHORIZE_PATH,
  REDIRECT_URI: process.env.APVS_MOJ_SSO_REDIRECT_URI,
  USER_PATH_PREFIX: process.env.APVS_MOJ_SSO_USER_PATH_PREFIX,
  USER_DETAILS_PATH: process.env.APVS_MOJ_SSO_USER_DETAILS_PATH,
  USER_EMAIL_PATH: process.env.APVS_MOJ_SSO_USER_EMAIL_PATH,
  USER_ROLES_PATH: process.env.APVS_MOJ_SSO_USER_ROLES_PATH,
  LOGOUT_PATH: process.env.APVS_MOJ_SSO_LOGOUT_PATH,
  TEST_SSO_EMAIL: process.env.APVS_MOJ_SSO_TEST_SSO_EMAIL,
  TEST_SSO_PASSWORD: process.env.APVS_MOJ_SSO_TEST_SSO_PASSWORD,

  // Payment
  PAYMENT_NUMBER_OF_PAYMENT_FILES: process.env.APVS_PAYMENT_NUMBER_OF_PAYMENT_FILES || '31',

  // File upload
  FILE_UPLOAD_LOCATION: process.env.FILE_UPLOAD_LOCATION || './uploads',
  FILE_UPLOAD_MAXSIZE: process.env.FILE_UPLOAD_MAXSIZE || '5242880', // 5MB in Bytes.

  // Assisted Digital external link
  EXTERNAL_SERVICE_URL: process.env.APVS_EXTERNAL_SERVICE_URL || 'http://localhost:3000',

  // Value configurations
  MAX_APPROVED_DIFFERENT_AMOUNT: process.env.MAX_APPROVED_DIFFERENT_AMOUNT || '250',

  // Session and Cookie security (CSRF)
  INT_APPLICATION_SECRET: process.env.APVS_INT_APPLICATION_SECRET, // NO DEFAULT FOR SECURITY REASONS, WILL FAIL IF NOT SET
  INT_SECURE_COOKIE: process.env.APVS_INT_SECURE_COOKIE || 'false',

  // Auto approval config defaults
  AUTO_APPROVAL_ENABLED: process.env.APVS_AUTO_APPROVAL_ENABLED || 'true',
  AUTO_APPROVAL_COST_VARIANCE: process.env.APVS_AUTO_APPROVAL_COST_VARIANCE || '10',
  AUTO_APPROVAL_MAX_CLAIM_TOTAL: process.env.APVS_AUTO_APPROVAL_MAX_CLAIM_TOTAL || '250',
  AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT: process.env.APVS_AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT || '28',
  AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR: process.env.APVS_AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR || '26',
  AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH: process.env.APVS_AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH || '4',
  AUTO_APPROVAL_COST_PER_MILE: process.env.APVS_AUTO_APPROVAL_COST_PER_MILE || '0.13',
  AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS: process.env.APVS_AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS || '4',

  // Assignment rules
  ASSIGNMENT_EXPIRY_TIME: process.env.APVS_ASSIGNMENT_EXPIRY_TIME || '60', // Number of minutes of inactivity to unassign caseworkers

  MAX_APPROVER_TOTAL: process.env.APVS_MAX_APPROVER_TOTAL || '250',

  // Azure App Insights
  APP_INSIGHTS_INSTRUMENTATION_KEY: process.env.APVS_APP_INSIGHTS_INSTRUMENTATION_KEY
}
