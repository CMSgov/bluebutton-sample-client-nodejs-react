import { Router, Request, Response } from 'express';
import { getLoggedInUser } from '../utils/user';
import config from '../configs/config';
import db from '../utils/db';

const envConfig = config[db.settings.env];

function getURL(path: string): string {
    return `${String(envConfig.bb2BaseUrl)}/${db.settings.version}/${path}`;
}

/* DEVELOPER NOTES:
* This is our mocked Data Service layer for both the BB2 API
* as well as for our mocked db Service Layer
* we grouped them together for use of use for the front-end
*/

export async function getBenefitDataOnly(req: Request) {
  const loggedInUser = getLoggedInUser(db);
  const FHIR_EOB_PATH = 'fhir/ExplanationOfBenefit/';
  const BB2_BENEFIT_URL = getURL(FHIR_EOB_PATH);

  if (!loggedInUser.authToken) {
    return { data: {} };
  }

  const response = await req.bb?.getExplanationOfBenefitData(loggedInUser.authToken);

  console.log(response);

  return response ? response?.response?.data : {};
}

// this function is used to query eob data for the authenticated Medicare.gov
// user and returned - we are then storing in a mocked DB
export async function getBenefitData(req: Request, res: Response) {
  const data = await getBenefitDataOnly(req);
  res.json(data);
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

  if (!loggedInUser.authToken) {
    return res.json({});
  }
  
  const response = await req.bb?.getPatientData(loggedInUser.authToken);
  // res.json(response?.response.data);
  res.json(response?.response?.data);
}

export async function getCoverageData(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);

  // get Coverage end point
  if (!loggedInUser.authToken) {
    return res.json({});
  }

  const response = await req.bb?.getCoverageData(loggedInUser.authToken);
  res.json(response?.response?.data);
}

export async function getUserProfileData(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);

  // get usrinfo end point
  if (!loggedInUser.authToken) {
    return res.json({});
  }

  const response = await req.bb?.getProfileData(loggedInUser.authToken);
  res.json(response?.response?.data);
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
