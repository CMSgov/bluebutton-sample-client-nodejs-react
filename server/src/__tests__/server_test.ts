import axios from "axios";
import app from '../Server';
import * as reqs from '../utils/request';

const BB2_BASE_URL = "https://sandbox.bluebutton.cms.gov";

const BB2_PATIENT_URL = `${BB2_BASE_URL}/v2/fhir/Patient/`;

const BB2_COVERAGE_URL = `${BB2_BASE_URL}/v2/fhir/Coverage/`;

const BB2_EOB_URL = `${BB2_BASE_URL}/v2/fhir/ExplanationOfBenefit/`;

const BB2_PROFILE_URL = `${BB2_BASE_URL}/v2/connect/userinfo`;

const eob = { status: 200, data: { resource: "EOB" } };

const coverage = { status: 200, data: { resource: "Coverage" } };

const patient = { status: 200, data: { resource: "Patient" } };

const profile = { status: 200, data: { resource: "Profile" } };

let server: any;

beforeAll(() => {
    server = app.listen(Number(3003));
  });
  
afterAll(() => {
  server.close();
});
  
test("expect patient end point returns patient data.", async () => {
  jest.clearAllMocks();
  // mock patient returned at deeper layer
  jest.spyOn(reqs, 'get').mockImplementation((url) =>
    {
        if (url === BB2_PATIENT_URL) {
            return Promise.resolve(patient);
        } else {
            throw Error("Invalid end point URL: " + url);
        }
    }
  );

  const response = await axios.get("http://localhost:3003/api/data/patient");

  expect(response.status).toEqual(200);
  expect(response.data).toEqual(patient.data);
});

test("expect profile end point returns profile data.", async () => {
  jest.clearAllMocks();
  // mock profile returned at lower level get
  jest.spyOn(reqs, 'get').mockImplementation((url) =>
    {
      if (url === BB2_PROFILE_URL) {
        return Promise.resolve(profile);
      } else {
        throw Error("Invalid end point URL: " + url);
      }
    });

    const response = await axios.get("http://localhost:3003/api/data/userprofile");
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(profile.data);
});

test("expect coverage end point returns coverage data.", async () => {
    jest.clearAllMocks();
    // mock coverage returned at deeper layer
    jest.spyOn(reqs, 'get').mockImplementation((url) =>
        {
            if (url === BB2_COVERAGE_URL) {
                return Promise.resolve(coverage);
            } else {
                throw Error("Invalid end point URL: " + url);
            }
        }
    );

    const response = await axios.get("http://localhost:3003/api/data/coverage");

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(coverage.data);
});

test("expect eob end point returns eob data.", async () => {
  jest.clearAllMocks();
  // mock eob returned at lower level get
  jest.spyOn(reqs, 'get').mockImplementation((url) =>
       {
         if (url === BB2_EOB_URL) {
           return Promise.resolve(eob);
         } else {
            throw Error("Invalid end point URL: " + url);
         }
       }
   );

   const response = await axios.get("http://localhost:3003/api/data/benefit-direct");
   expect(response.status).toEqual(200);
   expect(response.data).toEqual(eob.data);
});
