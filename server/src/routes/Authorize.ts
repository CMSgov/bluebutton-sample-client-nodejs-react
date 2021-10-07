import StatusCodes from 'http-status-codes';
import { Router, Request, Response } from 'express';
import AuthorizationToken from '../entities/AuthorizationToken';
import Settings from '../entities/Settings';
import db from '../utils/db';
import { getAccessToken, generateAuthorizeUrl } from '../utils/bb2';
import { getBenefitData } from './Data';
import { getLoggedInUser } from 'src/utils/user';


export async function authorizationCallback(req: Request, res: Response) {
    try {
        
        if (!req.query.code) {
            throw new Error('Response was missing access code');
        }
        if (db.settings.pkce && !req.query.state) {
            throw new Error('State is required when using PKCE');
        }

        // this gets the token from Medicare.gov once the 'user' authenticates their Medicare.gov account
        const response = await getAccessToken(req.query.code?.toString(), req.query.state?.toString());        
        const authToken = new AuthorizationToken(response.data);

        /* DEVELOPER NOTES:
        * This is where you would most likely place some type of
        * persistence service/functionality to store the token along with
        * the application user identifiers
         */        
    
        // Here we are grabbing the mocked 'user' for our application
        // to be able to store the access token for that user
        // thereby linking the 'user' of our sample applicaiton with their Medicare.gov account
        // providing access to their Medicare data to our sample application
        const loggedInUser = getLoggedInUser(db);
        loggedInUser.authToken = authToken;
        

        /* DEVELOPER NOTES:
        * Here we will use the token to get the EoB data for the mocked 'user' of the sample application
        * then to save trips to the BB2 API we will store it in the mocked db with the mocked 'user'
        *
        * You could also request data for the Patient endpoint and/or the Coverage endpoint here
        * using similar functionality
        */
        const eobData = await getBenefitData( req, res);
        loggedInUser.eobData = eobData;

    } catch (e) {
        /* DEVELOPER NOTES:
        * This is where you could also use a data service or other exception handling
        * to display or store the error
         */
        console.log(e);
    }
        /* DEVELOPER NOTE:
         * This is a hardcoded redirect, but this should be used from settings stored in a conf file
         * or other mechanism
         */
    res.redirect(`http://localhost:3000`);
}

export async function getAuthUrl(req: Request, res: Response) {

    /* DEVELOPER NOTE:
    * to utilize the latest security features/best practices
    * it is recommended to utilize pkce
    */
    const pkce = req.params.pkce === 'true';
    db.settings = new Settings({
        version: req.query?.version?.toString() || db.settings.version,
        env: req.query?.env?.toString() || db.settings.env,
        pkce: req.query?.pkce?.toString() ? pkce : db.settings.pkce
    });
    res.send(generateAuthorizeUrl());
}

export async function getCurrentAuthToken(req: Request, res: Response) {
    const loggedInUser = getLoggedInUser(db);
    res.send(loggedInUser.authToken);
}

const router = Router();

router.get('/bluebutton/callback', authorizationCallback);
router.get('/authorize/authurl', getAuthUrl);
router.get('/authorize/currentAuthToken', getCurrentAuthToken);
    
export default router;