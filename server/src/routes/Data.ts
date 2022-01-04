import { Router, Request, Response } from 'express';
import config from '../configs/config';
import db from '../utils/db';
import { getLoggedInUser } from 'src/utils/user';
import { get } from '../utils/request'

/* DEVELOPER NOTES:
* This is our mocked Data Service layer for both the BB2 API
* as well as for our mocked db Service Layer
* we grouped them together for use of use for the front-end
*/

// this function is used to query eob data for the authenticated Medicare.gov
// user and returned - we are then storing in a mocked DB
export async function getBenefitData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get EOB end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/ExplanationOfBenefit/`, req.query, `${loggedInUser.authToken?.access_token}`);
    return (response) ? response.data : null;
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
    if ( data && data.entry ) {
        res.json(data)
    }
    else {
        res.json({message: "Unable to load EOB Data."});
    }
}

export async function getPatientData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get Patient end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Patient/`, req.query, `${loggedInUser.authToken?.access_token}`);
    res.json(response.data);
}

export async function getCoverageData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get Coverage end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/fhir/Coverage/`, req.query, `${loggedInUser.authToken?.access_token}`);
    res.json(response.data);
}

export async function getUserProfileData(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    const envConfig = config[db.settings.env];
    // get usrinfo end point
    const response = await get(`${envConfig.bb2BaseUrl}/${db.settings.version}/connect/userinfo`, req.query, `${loggedInUser.authToken?.access_token}`);
    res.json(response.data);
}

const router = Router();

router.get('/benefit', getBenefitDataEndPoint);
router.get('/patient', getPatientData);
router.get('/coverage', getCoverageData);
router.get('/userprofile', getUserProfileData);

export default router;