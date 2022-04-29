import Settings from '../entities/Settings';
import { AuthorizationToken, AuthData } from 'cms-bluebutton-sdk';

/* DEVELOPER NOTES:
* This is our mocked DB
*/

export interface UserInfo {
  name: string,
  userName: string,
  pcp: string,
  primaryFacility: string
}

export interface User {
  authToken?: AuthorizationToken,
  authData?: AuthData,
  userInfo: UserInfo,
  eobData?: any,
  errors: string[]
}
export interface DB {
  patients: any,
  users: User[],
  settings: Settings
}

const db: DB = {
  patients: {},
  /*
    * DEVELOPER NOTES:
    *
    * We are hard coding a Mock 'User' here of our demo application to save time
    * creating/demoing a user logging into the application.
    *
    * This user will then need to linked to the Medicare.gov login
    * to approve of having their medicare data accessed by the application
    * these login's will be linked/related so anytime they login to the
    * application, the application will be able to pull their medicare data.
    *
    * Just for ease of getting and displaying the data
    * we are expecting this user to be linked to the
    * BB2 Sandbox User BBUser29999
    */
  users: [{
    userInfo: {
      name: 'John Doe',
      userName: 'jdoe29999',
      pcp: 'Dr. Hibbert',
      primaryFacility: 'Springfield General Hospital',
    },
    errors: [],
  }],
  settings: new Settings(undefined),
};

export default db;
