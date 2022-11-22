import express, { Request, Response } from "express";
import { AuthorizationToken, BlueButton } from "cms-bluebutton-sdk";

interface User {
    authToken?: AuthorizationToken,
    eobData?: any,
    errors?: string[]
}

const app = express();

const bb = new BlueButton();
const authData = bb.generateAuthData();

// This is where medicare.gov beneficiary associated
// with the current logged in app user,
// in real app, this could be the app specific
// account management system

const loggedInUser: User = {
};

// AuthorizationToken holds access grant info:
// access token, expire in, expire at, token type, scope, refreh token, etc.
// it is associated with current logged in user in real app,
// check SDK js docs for more details.

let authToken: AuthorizationToken;

// auth flow: response with URL to redirect to Medicare.gov beneficiary login
app.get("/api/authorize/authurl", (req: Request, res: Response) => {
  res.send(bb.generateAuthorizeUrl(authData));
});

// auth flow: oauth2 call back
app.get("/api/bluebutton/callback", async (req: Request, res: Response) => {
  if (typeof req.query.error === "string") {
    res.json({ message: req.query.error });
  } else {
    if (
      typeof req.query.code === "string" &&
      typeof req.query.state === "string"
    ) {
    //   let results;
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
        // const patientResults = await bb.getPatientData(authToken);
        // authToken = patientResults.token;
        // const coverageResults = await bb.getCoverageData(authToken);
        // authToken = coverageResults.token;
        // const profileResults = await bb.getProfileData(authToken);
        // authToken = profileResults.token;

        // nav pages if needed for eob, patient, coverage
        // client code can preemptively refresh tokens by calling refreshAuthToken(authToken)
        // console.log(
        //   "============= preemptively do oauth token refresh before fetch EOB ================="
        // );

        // console.log("============= authToken =================");

        // authToken = await bb.refreshAuthToken(authToken);

        // console.log(authToken);

        loggedInUser.authToken = authToken;
        // console.log("============= EOB PAGES =================");

        loggedInUser.eobData = eobResults.response?.data;
        // const eobs = await bb.getPages(eobbundle, authToken);
        // for (let i = 0; i < eobs.pages.length; i++) {
        //   fs.writeFileSync(`eob_p${i}.json`, JSON.stringify(eobs.pages[i]));
        // }

        // authToken = eobs.token;

        // console.log("=============PATIENT=================");
        // const ptbundle = patientResults.response?.data;
        // const pts = await bb.getPages(ptbundle, authToken);
        // authToken = pts.token;

        // console.log("=============COVERAGE=================");
        // const coveragebundle = coverageResults.response?.data;
        // const coverages = await bb.getPages(coveragebundle, authToken);
        // authToken = coverages.token;

        // console.log("=============PROFILE=================");
        // const pfbundle = profileResults.response?.data;
        // const pfs = await bb.getPages(pfbundle, authToken);
        // authToken = pfs.token;

        // results = {
        //   eob: eobs.pages,
        //   patient: pts.pages,
        //   coverage: coverages.pages,
        //   profile: pfs.pages,
        // };
      } catch (e) {
        console.log(e);
      }
    //   res.json(results);
    } else {
      //res.json({ message: "Missing AC in callback." });
      console.log("Missing AC in callback.");
    }
  }
  const fe_redirect_url = 
  process.env.SELENIUM_TESTS ? 'http://client:3000' : 'http://localhost:3000';
  res.redirect(fe_redirect_url);
});

// data flow: front end fetch eob
app.get("/api/data/benefit", async (req: Request, res: Response) => {
  if (loggedInUser.eobData) {
    res.json(loggedInUser.eobData);
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
