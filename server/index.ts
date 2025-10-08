import express, {Request, Response} from "express";
import {AuthorizationToken, BlueButton} from "cms-bluebutton-sdk";
import * as fs from "fs";

interface User {
    authToken?: AuthorizationToken,
    eobData?: any,
    errors?: string[]
}

const BENE_DENIED_ACCESS = "access_denied"
const FE_MSG_ACCESS_DENIED = "Beneficiary denied app access to their data"
const ERR_QUERY_EOB = "Error when querying the patient's EOB!"
const ERR_MISSING_AUTH_CODE = "Response was missing access code!"
const ERR_MISSING_STATE = "State is required when using PKCE"

const app = express();

const bb = new BlueButton();
const authData = bb.generateAuthData();

// This is where medicare.gov beneficiary associated
// with the current logged in app user,
// in real app, this could be the app specific
// account management system

const loggedInUser: User = {
};

// helper to clean up cached eob data
function clearBB2Data() {
    loggedInUser.authToken = undefined;
    loggedInUser.eobData = {};
}
  
// AuthorizationToken holds access grant info:
// access token, expire in, expire at, token type, scope, refreh token, etc.
// it is associated with current logged in user in real app,
// check SDK js docs for more details.

let authToken: AuthorizationToken;

// auth flow: response with URL to redirect to Medicare.gov beneficiary login
app.get("/api/authorize/authurl", (req: Request, res: Response) => {
  // for SMART App v2 scopes usage: explicitly
  // provide query parameter scope=<v2 scopes>
  // where <v2 scopes> is space delimited v2 scope specs (url encoded)
  // e.g. patient/ExplanationOfBenefit.rs
  const redirectUrl = bb.generateAuthorizeUrl(authData) +
   "&scope=patient%2FExplanationOfBenefit.rs"
  res.send(redirectUrl);
});

// auth flow: oauth2 call back
app.get("/api/bluebutton/callback", (req: Request, res: Response) => {
    (async (req: Request, res: Response) => {
        if (typeof req.query.error === "string") {
          // clear all cached claims eob data since the bene has denied access
          // for the application
          clearBB2Data();
          let errMsg = req.query.error;
          if (req.query.error === BENE_DENIED_ACCESS) {
              errMsg = FE_MSG_ACCESS_DENIED;
          }
          loggedInUser.eobData = {"message": errMsg};
          process.stdout.write(errMsg + '\n');
        } else {
          if (
            typeof req.query.code === "string" &&
            typeof req.query.state === "string"
          ) {
            try {
              authToken = await bb.getAuthorizationToken(
                authData,
                req.query.code,
                req.query.state
              );
              // data flow: after access granted
              // the app logic can fetch the beneficiary's data in app specific ways:
              // e.g. download EOB periodically etc.
              // access token can expire, SDK automatically refresh access token when that happens.
              const eobResults = await bb.getExplanationOfBenefitData(authToken);
              authToken = eobResults.token; // in case authToken got refreshed during fhir call
      
              loggedInUser.authToken = authToken;
      
              loggedInUser.eobData = eobResults.response?.data;
            } catch (e) {
              loggedInUser.eobData = {};
              process.stdout.write(ERR_QUERY_EOB + '\n');
              process.stderr.write("Exception: " + String(e) + '\n');
            }
          } else {
            clearBB2Data();
            process.stdout.write(ERR_MISSING_AUTH_CODE + '\n');
            process.stdout.write("OR" + '\n');
            process.stdout.write(ERR_MISSING_STATE + '\n');
            process.stdout.write("AUTH CODE: " + JSON.stringify(req.query.code) + '\n');
            process.stdout.write("STATE: " + JSON.stringify(req.query.state) + '\n');
          }
        }
        const fe_redirect_url = 
        process.env.SELENIUM_TESTS ? 'http://client:3000' : 'http://localhost:3000';
        res.redirect(fe_redirect_url);
      }
      )(req, res);
});

app.get("/api/bluebutton/loadDefaults", (req: Request, res: Response) => {
    loggedInUser.eobData = loadDataFile("Dataset 1", "eobData");
    res.send(process.env.SELENIUM_TESTS ? 'http://client:3000' : 'http://localhost:3000');
});

// helper to load json data from file
function loadDataFile(dataset_name: string, resource_file_name: string): any {
    const filename = `./default_datasets/${dataset_name}/${resource_file_name}.json`
    const resource = fs.readFileSync(filename, 'utf-8')

  try {
    return JSON.parse(resource);
  } catch (error) {
    process.stderr.write("Error parsing JSON: " + String(error) + '\n');
    return null
  }
}

// data flow: front end fetch eob
app.get("/api/data/benefit", (req: Request, res: Response) => {
  if (loggedInUser.eobData) {
    res.json(loggedInUser.eobData);
  }
});

const port = 3001;
app.listen(port, () => {
    process.stdout.write(`[server]: Server is running at https://localhost:${port}`);
    process.stdout.write("\n");
});
