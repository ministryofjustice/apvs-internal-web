const wdioConfHelper = require('./helpers/wdio-conf-helper')

exports.config = wdioConfHelper({
  services: ['sauce'],
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  baseUrl: process.env.INT_WEB_TEST_BASEURL || 'http://localhost:3001',
  sauceConnect: true,
  capabilities: [{
    maxInstances: 1,
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '8.0'
  }]
})
