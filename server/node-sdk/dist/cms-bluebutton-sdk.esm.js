import fs from 'fs';
import { cwd } from 'process';
import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var version = "1.0.5";

var Environments;
(function (Environments) {
    Environments["PRODUCTION"] = "PRODUCTION";
    Environments["SANDBOX"] = "SANDBOX";
    Environments["TEST"] = "TEST";
    Environments["LOCAL"] = "LOCAL";
})(Environments || (Environments = {}));
const SDK_HEADERS = {
    "X-BLUEBUTTON-SDK": "node",
    "X-BLUEBUTTON-SDK-VERSION": version,
};

var Errors;
(function (Errors) {
    Errors["CALLBACK_ACCESS_DENIED"] = "Callback request beneficiary denied access to their data";
    Errors["CALLBACK_ACCESS_CODE_MISSING"] = "Callback request is missing the CODE query parameter";
    Errors["CALLBACK_STATE_MISSING"] = "Callback request is missing the STATE query parameter";
    Errors["CALLBACK_STATE_DOES_NOT_MATCH"] = "Provided callback state does not match AuthData state";
    Errors["AUTH_TOKEN_URL_RESPONSE_DATA_MISSING"] = "Token endpoint response data is missing";
    Errors["GET_FHIR_RESOURCE_INALID_AUTH_TOKEN"] = "Invalid authorization token.";
})(Errors || (Errors = {}));

/**
 * Class holding access token and related info,
 * such as token type, scope, associated beneficiary fhir id (patient id),
 * expiration, refresh token.
 */
class AuthorizationToken {
    constructor(authToken) {
        this.accessToken = authToken.access_token;
        this.expiresIn = authToken.expires_in;
        this.expiresAt = authToken.expires_at
            ? authToken.expires_at
            : moment()
                .add(this.expiresIn * 1000)
                .valueOf();
        this.patient = authToken.patient;
        this.refreshToken = authToken.refresh_token;
        this.scope = authToken.scope;
        this.tokenType = authToken.token_type;
    }
}

function base64URLEncode(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
function sha256(str) {
    return crypto.createHash("sha256").update(str).digest();
}
function generatePkceData() {
    const verifier = base64URLEncode(crypto.randomBytes(32));
    return {
        codeChallenge: base64URLEncode(sha256(verifier)),
        verifier: verifier,
    };
}
function generateRandomState() {
    return base64URLEncode(crypto.randomBytes(32));
}
function generateAuthData() {
    const PkceData = generatePkceData();
    return {
        codeChallenge: PkceData.codeChallenge,
        verifier: PkceData.verifier,
        state: generateRandomState(),
    };
}
function getAuthorizationUrl(bb) {
    return `${bb.baseUrl}/v${bb.version}/o/authorize`;
}
function generateAuthorizeUrl(bb, AuthData) {
    const pkceParams = `code_challenge_method=S256&code_challenge=${AuthData.codeChallenge}`;
    return `${getAuthorizationUrl(bb)}?client_id=${bb.clientId}&redirect_uri=${bb.callbackUrl}&state=${AuthData.state}&response_type=code&${pkceParams}`;
}
//  Generates post data for call to access token URL
function generateTokenPostData(bb, authData, callbackCode) {
    return {
        client_id: bb.clientId,
        client_secret: bb.clientSecret,
        code: callbackCode,
        grant_type: "authorization_code",
        redirect_uri: bb.callbackUrl,
        code_verifier: authData.verifier,
    };
}
function validateCallbackRequestQueryParams(authData, callbackCode, callbackState, callbackError) {
    // Check state from callback here?
    if (callbackError === "access_denied") {
        throw new Error(Errors.CALLBACK_ACCESS_DENIED);
    }
    if (!callbackCode) {
        throw new Error(Errors.CALLBACK_ACCESS_CODE_MISSING);
    }
    if (!callbackState) {
        throw new Error(Errors.CALLBACK_STATE_MISSING);
    }
    if (callbackState != authData.state) {
        throw new Error(Errors.CALLBACK_STATE_DOES_NOT_MATCH);
    }
}
function getAccessTokenUrl(bb) {
    return `${bb.baseUrl}/v${bb.version}/o/token/`;
}
// Get an access token from callback code & state
function getAuthorizationToken(bb, authData, callbackRequestCode, callbackRequestState, callbackRequestError) {
    return __awaiter(this, void 0, void 0, function* () {
        validateCallbackRequestQueryParams(authData, callbackRequestCode, callbackRequestState, callbackRequestError);
        const postData = generateTokenPostData(bb, authData, callbackRequestCode);
        const resp = yield doPost(getAccessTokenUrl(bb), postData, {
            headers: SDK_HEADERS,
        });
        if (resp.data) {
            const authToken = new AuthorizationToken(resp.data);
            return authToken;
        }
        else {
            throw Error(Errors.AUTH_TOKEN_URL_RESPONSE_DATA_MISSING);
        }
    });
}
/**
 * Refresh the access token in the given AuthorizationToken instance
 *
 * @param authToken auth token instance to be refreshed
 * @param bb - instance of the SDK facade class
 * @returns new auth token instance with refreshed access token
 */
function refreshAuthToken(authToken, bb) {
    return __awaiter(this, void 0, void 0, function* () {
        const postData = {
            grant_type: "refresh_token",
            client_id: bb.clientId,
            refresh_token: authToken.refreshToken,
        };
        const resp = yield doPost(getAccessTokenUrl(bb), postData, {
            headers: SDK_HEADERS,
            auth: {
                username: bb.clientId,
                password: bb.clientSecret,
            },
        });
        return new AuthorizationToken(resp.data);
    });
}
/**
 *
 * @param url helper
 * @param postData - data to be posted
 * @param config - axios config
 * @returns the response
 */
function doPost(url, postData, config) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios.post(url, new URLSearchParams(postData), config);
    });
}

// also serves as central registry for supported resource paths
var FhirResourceType;
(function (FhirResourceType) {
    FhirResourceType["Patient"] = "fhir/Patient/";
    FhirResourceType["Coverage"] = "fhir/Coverage/";
    FhirResourceType["Profile"] = "connect/userinfo";
    FhirResourceType["ExplanationOfBenefit"] = "fhir/ExplanationOfBenefit/";
})(FhirResourceType || (FhirResourceType = {}));
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
function isRetryable(error, bb2) {
    return (error.response &&
        bb2.retrySettings.total > 0 &&
        bb2.retrySettings.statusForcelist.includes(error.response.status));
}
function doRetry(fhirUrl, config, bb2) {
    return __awaiter(this, void 0, void 0, function* () {
        let resp;
        for (let i = 0; i < bb2.retrySettings.total; i++) {
            const waitInSec = bb2.retrySettings.backoffFactor * Math.pow(2, (i - 1));
            yield sleep(waitInSec * 1000);
            try {
                resp = yield axios.get(fhirUrl, config);
                break;
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    resp = error.response;
                    if (!isRetryable(error, bb2)) {
                        // break out if error is not retryable
                        break;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        return resp;
    });
}
function getFhirResourceByPath(resourcePath, authToken, bb2, axiosConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let newAuthToken = authToken;
        // now the on demand token refresh can be disabled
        if (bb2.tokenRefreshOnExpire) {
            // rare edge case: access token in authToken become expired right after below check
            // and before subsequent fhir end point call, in that case, a correctional action
            // by the app logic might be a recommended practice.
            if (moment(authToken.expiresAt).isBefore(moment())) {
                newAuthToken = yield refreshAuthToken(authToken, bb2);
            }
        }
        // modified to allow absolute path if it is under base URL
        const fhirUrl = resourcePath.startsWith(bb2.baseUrl)
            ? resourcePath
            : `${String(bb2.baseUrl)}/v${bb2.version}/${resourcePath}`;
        let resp = null;
        const config = Object.assign(Object.assign({}, axiosConfig), { headers: Object.assign(Object.assign(Object.assign({}, axiosConfig.headers), { Authorization: `Bearer ${newAuthToken.accessToken}` }), SDK_HEADERS) });
        try {
            resp = yield axios.get(fhirUrl, config);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (isRetryable(error, bb2)) {
                    resp = yield doRetry(fhirUrl, config, bb2);
                }
                else {
                    // a response attribute expected on an AxiosError
                    resp = error.response;
                }
            }
            else {
                // other errors - likely axios internal exception etc.
                throw error;
            }
        }
        return {
            token: newAuthToken,
            response: resp,
        };
    });
}
function getFhirResource(resourceType, authToken, bb2, axiosConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getFhirResourceByPath(`${resourceType}`, authToken, bb2, axiosConfig);
    });
}

const DEFAULT_CONFIG_FILE_LOCATION = `${cwd()}/.bluebutton-config.json`;
const LOCAL_BASE_URL = "http://localhost:8000";
const TEST_BASE_URL = "https://test.bluebutton.cms.gov";
const SANDBOX_BASE_URL = "https://sandbox.bluebutton.cms.gov";
const PRODUCTION_BASE_URL = "https://api.bluebutton.cms.gov";
/**
 * BlueButton - the main SDK class
 */
class BlueButton {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        let bbJsonConfig;
        this.retrySettings = {
            backoffFactor: 5,
            total: 3,
            statusForcelist: [500, 502, 503, 504],
        };
        if (!config) {
            try {
                const rawdata = fs.readFileSync(DEFAULT_CONFIG_FILE_LOCATION);
                const jsonConfig = JSON.parse(rawdata.toString());
                bbJsonConfig = this.normalizeConfig(jsonConfig);
            }
            catch (e) {
                throw new Error(`Failed to load config file at: ${DEFAULT_CONFIG_FILE_LOCATION}, ${e}`);
            }
        }
        else if (typeof config === "string") {
            try {
                const rawdata = fs.readFileSync(config);
                const jsonConfig = JSON.parse(rawdata.toString());
                bbJsonConfig = this.normalizeConfig(jsonConfig);
            }
            catch (e) {
                throw new Error(`Failed to load config file at: ${config}, ${e}`);
            }
        }
        else {
            bbJsonConfig = this.normalizeConfig(config);
        }
        if (!bbJsonConfig.clientId) {
            throw new Error("clientId is required");
        }
        if (!bbJsonConfig.clientSecret) {
            throw new Error("clientSecret is required");
        }
        if (!bbJsonConfig.callbackUrl) {
            throw new Error("callbackUrl is required");
        }
        if (((_a = bbJsonConfig.retrySettings) === null || _a === void 0 ? void 0 : _a.backoffFactor) ||
            ((_b = bbJsonConfig.retrySettings) === null || _b === void 0 ? void 0 : _b.backoffFactor) === 0) {
            if (((_c = bbJsonConfig.retrySettings) === null || _c === void 0 ? void 0 : _c.backoffFactor) <= 0) {
                throw new Error(`Invalid retry settings parameter backoffFactor = ${(_d = bbJsonConfig.retrySettings) === null || _d === void 0 ? void 0 : _d.backoffFactor}: must be > 0`);
            }
            this.retrySettings.backoffFactor =
                (_e = bbJsonConfig.retrySettings) === null || _e === void 0 ? void 0 : _e.backoffFactor;
        }
        if (((_f = bbJsonConfig.retrySettings) === null || _f === void 0 ? void 0 : _f.total) ||
            ((_g = bbJsonConfig.retrySettings) === null || _g === void 0 ? void 0 : _g.total) === 0) {
            this.retrySettings.total = (_h = bbJsonConfig.retrySettings) === null || _h === void 0 ? void 0 : _h.total;
        }
        if ((_j = bbJsonConfig.retrySettings) === null || _j === void 0 ? void 0 : _j.statusForcelist) {
            this.retrySettings.statusForcelist =
                (_k = bbJsonConfig.retrySettings) === null || _k === void 0 ? void 0 : _k.statusForcelist;
        }
        this.baseUrl = bbJsonConfig.baseUrl;
        this.clientId = bbJsonConfig.clientId;
        this.callbackUrl = bbJsonConfig.callbackUrl;
        this.clientSecret = bbJsonConfig.clientSecret;
        this.version = bbJsonConfig.version;
        this.tokenRefreshOnExpire = bbJsonConfig.tokenRefreshOnExpire;
    }
    normalizeConfig(config) {
        if (config.environment &&
            !Object.values(Environments).includes(config.environment)) {
            throw new Error(`Invalid environment (='${config.environment}'): must be ${Environments.PRODUCTION} or ${Environments.SANDBOX} or ${`Environments.TEST`} or ${Environments.LOCAL}`);
        }
        return {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            callbackUrl: config.callbackUrl,
            retrySettings: config.retrySettings,
            version: config.version ? config.version : "2",
            tokenRefreshOnExpire: (config === null || config === void 0 ? void 0 : config.tokenRefreshOnExpire) == null
                ? true
                : config.tokenRefreshOnExpire,
            baseUrl: config.environment === Environments.PRODUCTION
                ? PRODUCTION_BASE_URL
                : config.environment === Environments.TEST
                    ? TEST_BASE_URL
                    : config.environment === Environments.LOCAL
                        ? LOCAL_BASE_URL
                        : SANDBOX_BASE_URL,
        };
    }
    /**
     * Returns the ExplanationOfBenefitData resources for the authorized beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Bundle of ExplanationOfBenefitData resources
     */
    getExplanationOfBenefitData(authToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFhirResource(FhirResourceType.ExplanationOfBenefit, authToken, this, config);
        });
    }
    /**
     * Returns the Patient resource for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Patient resources
     */
    getPatientData(authToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFhirResource(FhirResourceType.Patient, authToken, this, config);
        });
    }
    /**
     * Returns the Coverage resources for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Bundle of Coverage resources
     */
    getCoverageData(authToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFhirResource(FhirResourceType.Coverage, authToken, this, config);
        });
    }
    /**
     * Returns the profile for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and profile
     */
    getProfileData(authToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFhirResource(FhirResourceType.Profile, authToken, this, config);
        });
    }
    /**
     * Returns the resource(s) for the current (authorized) beneficiary as identified by the url path
     * @param path - url path for the resurce(s)
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and the resource(s)
     */
    getCustomData(path, authToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFhirResourceByPath(path, authToken, this, config);
        });
    }
    /**
     * Extract 'next' page url from a FHIR search result (Bundle with nav links)
     * overload for convenience ('next' nav link is more frequently used to fetch all pages)
     * @param data - data in json, expect to be a FHIR Bundle of type 'searchset' with page nav links
     * @returns the url or null if expected structure not present
     */
    extractNextPageUrl(data) {
        return this.extractPageNavUrl(data, "next");
    }
    /**
     * Extract the specified nav link page url from a FHIR search result (Bundle with nav links)
     * @param data - data in json, expect to be a FHIR Bundle of type 'searchset' with page nav links
     * @param relation - the nav relation to current page: 'first', 'previous', 'next', 'self', 'last'
     * @returns the url or null if expected structure not present
     */
    extractPageNavUrl(data, relation) {
        if (data &&
            data.resourceType === "Bundle" &&
            data.type &&
            data.type === "searchset" &&
            data.link) {
            for (const l of data.link) {
                if (l.relation === relation) {
                    return l.url;
                }
            }
        }
        return null;
    }
    /**
     * Given a navigatable FHIR search result (Bundle with nav links), navigate forward until max pages reached
     * or when there is no next page whichever comes first, and return all the pages as a list.
     * @param data - current page of a FHIR search result (Bundle) with nav links
     * @param authToken - AuthorizationToken with access token info
     * @returns authToken (might be updated during fhir data call) and the page(s) as a list
     */
    getPages(data, authToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let bundle = data;
            let at = authToken;
            const pages = [bundle];
            let pageURL = this.extractNextPageUrl(bundle);
            while (pageURL) {
                const eobNextPage = yield this.getCustomData(pageURL, authToken);
                at = eobNextPage.token;
                bundle = (_a = eobNextPage.response) === null || _a === void 0 ? void 0 : _a.data;
                pages.push(bundle);
                pageURL = this.extractNextPageUrl(bundle);
            }
            return { token: at, pages: pages };
        });
    }
    /**
     * Generate hashes for PKCE
     * @returns AuthData object
     */
    generateAuthData() {
        return generateAuthData();
    }
    /**
     * Generate URL for beneficiary login (Medicare.gov)
     * @param authData - PKCE data used in the URL
     * @returns the URL direct to beneficiary login
     */
    generateAuthorizeUrl(authData) {
        return generateAuthorizeUrl(this, authData);
    }
    /**
     * Given an instance of AuthorizationToken (containing access token and refresh token),
     * refresh the access token and also will obtain a new refresh token.
     * @param authToken - AuthorizationToken instance with access token info
     * @returns new AuthorizationToken instance with newly issued (refreshed) access token (and refresh token)
     */
    refreshAuthToken(authToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return refreshAuthToken(authToken, this);
        });
    }
    /**
     * Callback of OAUTH2 flow, App's oauth2 callback is routed to this function,
     * the returned AuthorizationToken object is used by subsequent Fhir resource(s)
     * queries
     * @param authData - PKCE data
     * @param callbackRequestCode - Auhtorization Code
     * @param callbackRequestState - the state
     * @param callbackRequestError - the error if any
     * @returns AuthorizationToken object containing access token, refresh token, etc.
     */
    getAuthorizationToken(authData, callbackRequestCode, callbackRequestState, callbackRequestError) {
        return __awaiter(this, void 0, void 0, function* () {
            return getAuthorizationToken(this, authData, callbackRequestCode, callbackRequestState, callbackRequestError);
        });
    }
}

export { AuthorizationToken, BlueButton, Environments, Errors };
