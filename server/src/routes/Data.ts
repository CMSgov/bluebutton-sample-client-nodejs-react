import { Router, Request, Response } from 'express';
import moment from 'moment';
import { getLoggedInUser } from '../utils/user';
import { refreshAccessToken } from '../utils/bb2';
import config from '@configs/config';
import db from '../utils/db';
import { get } from '../utils/request';

const envConfig = config[db.settings.env];

function getURL(path: string): string {
    return `${String(envConfig.bb2BaseUrl)}/${db.settings.version}/${path}`;
}

/* DEVELOPER NOTES:
* This is our mocked Data Service layer for both the BB2 API
* as well as for our mocked db Service Layer
* we grouped them together for use of use for the front-end
*/

// this function is used to query eob data for the authenticated Medicare.gov
// user and returned - we are then storing in a mocked DB
export async function getBenefitData(req: Request) {
  const loggedInUser = getLoggedInUser(db);
  const FHIR_EOB_PATH = 'fhir/ExplanationOfBenefit/';
  const BB2_BENEFIT_URL = getURL(FHIR_EOB_PATH);

  if (!loggedInUser.authToken || !loggedInUser.authToken.accessToken) {
    return { data: {} };
  }

  /*
  * If the access token is expired, use the refresh token to generate a new one
  */
  if (moment(loggedInUser.authToken.expiresAt).isBefore(moment())) {
    const newAuthToken = await refreshAccessToken(loggedInUser.authToken.refreshToken);
    loggedInUser.authToken = newAuthToken;
  }

  const response = await get(BB2_BENEFIT_URL, req.query, `${loggedInUser.authToken?.accessToken}`);

  if (response.status === 200) {
    return response.data as unknown;
  }

  // send generic error to client
  const general_err = '{"message": "Unable to load EOB Data - fetch FHIR resource error."}';
  return JSON.parse(general_err) as unknown;
}

/*
* DEVELOPER NOTES:
* this function is used directly by the front-end to
* retrieve eob data from the mocked DB
* This would be replaced by a persistence service layer for whatever
*  DB you would choose to use
*/
export function getBenefitDataEndPoint(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  const data = loggedInUser.eobData;
  if (data) {
    res.json(data);
  }
}

export async function getPatientData(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  // get Patient end point
  const response = await get(getURL('fhir/Patient/'),
                             req.query,
                             `${loggedInUser.authToken?.accessToken || 'no access token'} `);
  res.json(response.data);
}

export async function getCoverageData(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  // get Coverage end point
  const response = await get(getURL('fhir/Coverage/'),
                             req.query,
                             `${loggedInUser.authToken?.accessToken || 'no access token'}`);
  res.json(response.data);
}

export async function getUserProfileData(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  // get usrinfo end point
  const response = await get(getURL('connect/userinfo'),
                             req.query,
                             `${loggedInUser.authToken?.accessToken || 'no access token'}`);
  res.json(response.data);
}

const router = Router();

router.get('/benefit', getBenefitDataEndPoint);
// turn off eslinting for below router get function - it's OK to call a async which return a promise
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/benefit-direct', getBenefitData);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/patient', getPatientData);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/coverage', getCoverageData);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/userprofile', getUserProfileData);

export default router;
