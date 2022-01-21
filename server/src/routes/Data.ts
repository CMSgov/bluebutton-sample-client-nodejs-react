import { Router, Request, Response } from 'express';
import moment from 'moment';
import config from '../configs/config';
import db from '../utils/db';
import { get } from '../utils/request'
import { getLoggedInUser } from 'src/utils/user';
import { refreshAccessToken } from 'src/utils/bb2';

// function getBearerHeader() {
//     const loggedInUser = getLoggedInUser(db);
//     return {
//       Authorization: `Bearer ${loggedInUser?.authToken?.accessToken || 'Invalid Token'}`,
//     };
//   }
  
/* DEVELOPER NOTES:
* This is our mocked Data Service layer for both the BB2 API
* as well as for our mocked db Service Layer
* we grouped them together for use of use for the front-end
*/

// this function is used to query eob data for the authenticated Medicare.gov
// user and returned - we are then storing in a mocked DB
export async function getBenefitData(req: Request) {
  const loggedInUser = getLoggedInUser(db);
  const envConfig = config[db.settings.env];
  const FHIR_EOB_PATH = 'fhir/ExplanationOfBenefit/';
  const BB2_BENEFIT_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/${FHIR_EOB_PATH}`;

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
    return response.data;
  }
  else {
    // send generic error to client
    return JSON.parse('{"message": "Unable to load EOB Data - fetch FHIR resource error."}');
  }
  
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
    if ( data ) {
        res.json(data)
    }
}

export async function getPatientData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get Patient end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Patient/`, req.query, `${loggedInUser.authToken?.accessToken}`);
    res.json(response.data);
}

export async function getCoverageData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get Coverage end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Coverage/`, req.query, `${loggedInUser.authToken?.accessToken}`);
    res.json(response.data);
}

export async function getUserProfileData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get usrinfo end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/connect/userinfo`, req.query, `${loggedInUser.authToken?.accessToken}`);
    res.json(response.data);
}

const router = Router();

// turn off eslinting for below router get function - it's OK to call a async which return a promise
// eslint-disable-next-line
router.get('/benefit', getBenefitDataEndPoint);
// eslint-disable-next-line
router.get('/benefit-direct', getBenefitData);
// eslint-disable-next-line
router.get('/patient', getPatientData);
// eslint-disable-next-line
router.get('/coverage', getCoverageData);
// eslint-disable-next-line
router.get('/userprofile', getUserProfileData);

export default router;
