import { Router, Request, Response } from 'express';
import axios from 'axios';
import getLoggedInUser from '../utils/user';
import config from '../configs/config';
import db from '../utils/db';

function getBearerHeader() {
  const loggedInUser = getLoggedInUser(db);
  return {
    Authorization: `Bearer ${loggedInUser?.authToken?.accessToken || 'Invalid Token'}`,
  };
}

/* DEVELOPER NOTES:
* This is our mocked Data Service layer for both the BB2 API
* as well as for our mocked db Service Layer
* we grouped them together for use of use for the front-end
*/

// this function is used to query eob data for the authenticated Medicare.gov
// user and returned - we are then storing in a mocked DB
export async function getBenefitData(req: Request) {
  const envConfig = config[db.settings.env];
  const FHIR_EOB_PATH = 'fhir/ExplanationOfBenefit/';
  const BB2_BENEFIT_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/${FHIR_EOB_PATH}`;

  const response = await axios.get(BB2_BENEFIT_URL, {
    params: req.query,
    headers: getBearerHeader(),
  });
  return response;
}

/*
* DEVELOPER NOTES:
* this function is used directly by the front-end to
* retrieve eob data from the mocked DB
* This would be replaced by a persistence service layer for whatever
*  DB you would choose to use
*/
export async function getBenefitDataEndPoint(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  const data = loggedInUser.eobData;
  res.json(data);
}

export async function getPatientData(req: Request, res: Response) {
  const envConfig = config[db.settings.env];
  const BB2_PATIENT_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Patient/`;
  const response = await axios.get(BB2_PATIENT_URL, {
    params: req.query,
    headers: getBearerHeader(),
  });
  res.json(response.data);
}

export async function getCoverageData(req: Request, res: Response) {
  const envConfig = config[db.settings.env];
  const BB2_COVERAGE_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Coverage/`;

  const response = await axios.get(BB2_COVERAGE_URL, {
    params: req.query,
    headers: getBearerHeader(),
  });

  res.json(response.data);
}

export async function getUserProfileData(req: Request, res: Response) {
  const envConfig = config[db.settings.env];
  const BB2_BENEFIT_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/connect/userinfo`;

  const response = await axios.get(BB2_BENEFIT_URL, {
    params: req.query,
    headers: getBearerHeader(),
  });

  res.json(response.data);
}

const router = Router();

// turn off eslinting for below router get function - it's OK to call a async which return a promise
// eslint-disable-next-line
router.get('/benefit', getBenefitDataEndPoint);
// eslint-disable-next-line
router.get('/patient', getPatientData);
// eslint-disable-next-line
router.get('/coverage', getCoverageData);
// eslint-disable-next-line
router.get('/userprofile', getUserProfileData);

export default router;
