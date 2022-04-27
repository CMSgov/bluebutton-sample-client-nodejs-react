import { Router, Request, Response } from 'express';
import { clearBB2Data, getLoggedInUser } from '../utils/user';
import logger from '../shared/Logger';
import Settings from '../entities/Settings';
import db from '../utils/db';
import { getAccessToken, generateAuthorizeUrl } from '../utils/bb2';
import { getBenefitData, getBenefitDataOnly } from './Data';

const BENE_DENIED_ACCESS = 'access_denied';

export async function authorizationCallback(req: Request, res: Response) {
  try {

    /* DEVELOPER NOTES:
        There is only 1 user in this case so we are using this convenience function here
        In a real application you'll most likely want to tie your user to the request using the state from the auth data
        you can get the state from the req.query.state
    */

    const loggedInUser = getLoggedInUser(db);

    if (!loggedInUser.authData) {
      throw new Error('Missing auth data');
    }

    console.log(loggedInUser);
    console.log(req.query);

    const authToken = await req.bb?.getAuthorizationToken(loggedInUser.authData, req.query.code?.toString(), req.query.state?.toString(), req.query.error?.toString());
    console.log(authToken)
    /* DEVELOPER NOTES:
       * This is where you would most likely place some type of
       * persistence service/functionality to store the token along with
       * the application user identifiers
       */

      // Here we are grabbing the mocked 'user' for our application
      // to be able to store the access token for that user
      // thereby linking the 'user' of our sample applicaiton with their Medicare.gov account
      // providing access to their Medicare data to our sample application
    loggedInUser.authToken = authToken;

    /* DEVELOPER NOTES:
       * Here we will use the token to get the EoB data for the mocked 'user' of the sample
       * application then to save trips to the BB2 API we will store it in the mocked db
       * with the mocked 'user'
       *
       * You could also request data for the Patient endpoint and/or the Coverage endpoint here
       * using similar functionality
       */
    const eobData = await getBenefitDataOnly(req);
    loggedInUser.eobData = eobData;
//      const eobData = await getBenefitData(req, res);
//      loggedInUser.eobData = eobData;
//    } else {
//      // send generic error message to FE
//      const general_err = '{"message": "Unable to load EOB Data - authorization failed."}';
//      loggedInUser.eobData = JSON.parse(general_err);
//    }
  } catch (e) {
    /* DEVELOPER NOTES:
     * This is where you could also use a data service or other exception handling
     * to display or store the error
     */
    console.log(e)
    logger.err(e);
  }
  /* DEVELOPER NOTE:
   * This is a hardcoded redirect, but this should be used from settings stored in a conf file
   * or other mechanism
   */
  res.redirect('http://localhost:3000');
}

export function getAuthUrl(req: Request, res: Response) {
  if (!req.bb) {
    throw new Error('BB SDK was not attached to req');
  }

  const authData = req.bb.generateAuthData();
  const loggedInUser = getLoggedInUser(db);
  loggedInUser.authData = authData;
  res.send(req.bb.generateAuthorizeUrl(authData));
}

export function getCurrentAuthToken(req: Request, res: Response) {
  const loggedInUser = getLoggedInUser(db);
  res.send(loggedInUser.authToken);
}

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/bluebutton/callback', authorizationCallback);
router.get('/authorize/authurl', getAuthUrl);
router.get('/authorize/currentAuthToken', getCurrentAuthToken);

export default router;
