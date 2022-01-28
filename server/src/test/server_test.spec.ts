import chai, { expect } from 'chai';
import 'mocha';
import nock from 'nock';

import chaiHttp from 'chai-http';
import logger from '@shared/Logger';
import app from '@server';

chai.use(chaiHttp);

before('Server start - listening on 3003.', () => {
  app.listen(Number(3003), () => {
    logger.info('Express server started on port: 3003');
  });
});

after('Shutdown server...', () => {
  logger.info('Shutdown server ...');
});

describe('Get FHIR resource: Patient ...', () => {
  beforeEach('Nock external Patient search response:', () => {
    nock('https://sandbox.bluebutton.cms.gov')
      .get('/v2/fhir/Patient/')
      .reply(200, {
        status: 200,
        message: 'This is a mocked FHIR Patient response.',
      });
  });

  it('Verify FHIR Patient search response.', () => {
    chai.request(app).get('/api/data/patient').end((err, res) => {
      expect(res.body.status).to.equal(200);
      expect(res.body.message).to.equal('This is a mocked FHIR Patient response.');
    });
  });
});

describe('Get FHIR resource: Coverage ...', () => {
  beforeEach('Nock external FHIR Coverage search response:', () => {
    nock('https://sandbox.bluebutton.cms.gov')
      .get('/v2/fhir/Coverage/')
      .reply(200, {
        status: 200,
        message: 'This is a mocked FHIR Coverage response.',
      });
  });

  it('Verify FHIR Coverage search response.', () => {
    chai.request(app).get('/api/data/coverage').end((err, res) => {
      expect(res.body.status).to.equal(200);
      expect(res.body.message).to.equal('This is a mocked FHIR Coverage response.');
    });
  });
});

describe('Get FHIR resource: ExplanationOfBenefit ...', () => {
  beforeEach('Nock external FHIR ExplanationOfBenefit search response:', () => {
    nock('https://sandbox.bluebutton.cms.gov')
      .get('/v2/fhir/ExplanationOfBenefit/')
      .reply(200, {
        status: 200,
        message: 'This is a mocked FHIR ExplanationOfBenefit response.',
      });
  });

  it('Verify FHIR ExplanationOfBenefit search response.', () => {
    chai.request(app).get('/api/data/benefit-direct').end((err, res) => {
      expect(res.body.status).to.equal(200);
      expect(res.body.message).to.equal('This is a mocked FHIR ExplanationOfBenefit response.');
    });
  });
});

describe('Get User Profile ...', () => {
  beforeEach('Nock external FHIR User Profile search response:', () => {
    nock('https://sandbox.bluebutton.cms.gov')
      .get('/v2/connect/userinfo')
      .reply(200, {
        status: 200,
        message: 'This is a mocked Userprofile response.',
      });
  });

  it('Verify User Profile search response.', () => {
    chai.request(app).get('/api/data/userprofile').end((err, res) => {
      expect(res.body.status).to.equal(200);
      expect(res.body.message).to.equal('This is a mocked FHIR Userprofile response.');
    });
  });
});
