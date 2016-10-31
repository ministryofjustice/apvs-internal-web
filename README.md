# apvs-internal-web

[![Build Status](https://travis-ci.org/ministryofjustice/apvs-internal-web.svg?branch=develop)](https://travis-ci.org/ministryofjustice/apvs-internal-web?branch=develop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Beta implementation of the Assisted Prison Visits Scheme internal web application.

## Requirements

* Docker (Including Docker Compose)
* Node 6 (Including NPM) - If running locally

## Run

### Locally
Install dependencies and run on port 3001.

```
npm install
npm start
```

### With Docker Compose
This will run the Internal Web application in development mode.

```
docker-compose build
docker-compose up
```

### Heroku

The application can be deployed to [heroku](https://www.heroku.com/) for quick preview.

Deployment to heroku is automatically performed by [Travis using an encrypted deployment key](https://docs.travis-ci.com/user/deployment/heroku/) in `.travis.yml`.

```
heroku login
heroku create
heroku buildpacks:set heroku/nodejs

# Set config vars for application
# heroku config:set DB_USERNAME=mydbuser

git push heroku master
```

## Test

```
npm test                        # checks code against standard JS and runs mocha unit tests.
npm run-script test-coverage    # unit tests and generates code coverage using Istanbul
npm run-script test-unit        # unit tests
npm run-script test-integration # integration tests
npm run-script test-e2e         # e2e tests using selenium standalone against local
```

Run e2e tests with [saucelabs](https://saucelabs.com)
```
# set environmental variables for saucelabs
export SAUCE_USERNAME='MY_USERNAME'
export SAUCE_ACCESS_KEY='MY_KEY'
export INT_WEB_TEST_BASEURL='http://localhost:3001' # proxy url for sauce connect

npm run-script test-e2e-ie8
npm run-script test-e2e-firefox
```

## Database

The application requires a MS SQL database instance, configured with an internal web user and a migration user. See [here](https://github.com/ministryofjustice/apvs/tree/develop/database) for details.

To run the [knex](http://knexjs.org/) database migrations:

```
npm run-script migrations
```

To rollback the last batch of changes:
```
./node_modules/.bin/knex migrate:rollback --env migrations
```