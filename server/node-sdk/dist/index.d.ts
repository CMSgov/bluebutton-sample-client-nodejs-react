import { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';

/**
 * Complex type holding PKCE verifier, code challenge, and state
 */
export declare type AuthData = {
    codeChallenge: string;
    verifier: string;
    state: string;
};

/**
 * Class holding access token and related info,
 * such as token type, scope, associated beneficiary fhir id (patient id),
 * expiration, refresh token.
 */
export declare class AuthorizationToken {
    accessToken: string;
    expiresIn: number;
    expiresAt: number;
    tokenType: string;
    scope: string[];
    refreshToken: string;
    patient: string;
    constructor(authToken: AuthorizationTokenData);
}

/**
 * Complex type holding access token and related info,
 * such as token type, scope, associated beneficiary fhir id (patient id),
 * expiration, refresh token.
 */
export declare type AuthorizationTokenData = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string[];
    refresh_token: string;
    patient: string;
    expires_at?: number;
};

/**
 * BlueButton - the main SDK class
 */
export declare class BlueButton {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    version: string;
    baseUrl: string;
    retrySettings: RetryConfig;
    tokenRefreshOnExpire: boolean;
    constructor(config?: BlueButtonConfig);
    normalizeConfig(config: BlueButtonJsonConfig): {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
        retrySettings: RetryConfig | undefined;
        version: string;
        tokenRefreshOnExpire: boolean;
        baseUrl: string;
    };
    /**
     * Returns the ExplanationOfBenefitData resources for the authorized beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Bundle of ExplanationOfBenefitData resources
     */
    getExplanationOfBenefitData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any, {}> | undefined;
    }>;
    /**
     * Returns the Patient resource for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Patient resources
     */
    getPatientData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any, {}> | undefined;
    }>;
    /**
     * Returns the Coverage resources for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and Fhir Bundle of Coverage resources
     */
    getCoverageData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any, {}> | undefined;
    }>;
    /**
     * Returns the profile for the current (authorized) beneficiary
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and profile
     */
    getProfileData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any, {}> | undefined;
    }>;
    /**
     * Returns the resource(s) for the current (authorized) beneficiary as identified by the url path
     * @param path - url path for the resurce(s)
     * @param authToken - AuthorizationToken with access token info
     * @param config - extra request parameters
     * @returns authToken and the resource(s)
     */
    getCustomData(path: string, authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any, {}> | undefined;
    }>;
    /**
     * Extract 'next' page url from a FHIR search result (Bundle with nav links)
     * overload for convenience ('next' nav link is more frequently used to fetch all pages)
     * @param data - data in json, expect to be a FHIR Bundle of type 'searchset' with page nav links
     * @returns the url or null if expected structure not present
     */
    extractNextPageUrl(data: any): any;
    /**
     * Extract the specified nav link page url from a FHIR search result (Bundle with nav links)
     * @param data - data in json, expect to be a FHIR Bundle of type 'searchset' with page nav links
     * @param relation - the nav relation to current page: 'first', 'previous', 'next', 'self', 'last'
     * @returns the url or null if expected structure not present
     */
    extractPageNavUrl(data: any, relation: string): any;
    /**
     * Given a navigatable FHIR search result (Bundle with nav links), navigate forward until max pages reached
     * or when there is no next page whichever comes first, and return all the pages as a list.
     * @param data - current page of a FHIR search result (Bundle) with nav links
     * @param authToken - AuthorizationToken with access token info
     * @returns authToken (might be updated during fhir data call) and the page(s) as a list
     */
    getPages(data: any, authToken: AuthorizationToken): Promise<{
        token: AuthorizationToken;
        pages: any[];
    }>;
    /**
     * Generate hashes for PKCE
     * @returns AuthData object
     */
    generateAuthData(): AuthData;
    /**
     * Generate URL for beneficiary login (Medicare.gov)
     * @param authData - PKCE data used in the URL
     * @returns the URL direct to beneficiary login
     */
    generateAuthorizeUrl(authData: AuthData): string;
    /**
     * Given an instance of AuthorizationToken (containing access token and refresh token),
     * refresh the access token and also will obtain a new refresh token.
     * @param authToken - AuthorizationToken instance with access token info
     * @returns new AuthorizationToken instance with newly issued (refreshed) access token (and refresh token)
     */
    refreshAuthToken(authToken: AuthorizationToken): Promise<AuthorizationToken>;
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
    getAuthorizationToken(authData: AuthData, callbackRequestCode?: string, callbackRequestState?: string, callbackRequestError?: string): Promise<AuthorizationToken>;
}

export declare type BlueButtonConfig = string | BlueButtonJsonConfig;

/**
 * Configuration parameters for a Blue Button API application
 */
export declare type BlueButtonJsonConfig = {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    version?: string;
    environment?: Environments;
    retrySettings?: RetryConfig;
    tokenRefreshOnExpire?: boolean;
};

export declare enum Environments {
    PRODUCTION = "PRODUCTION",
    SANDBOX = "SANDBOX",
    TEST = "TEST",
    LOCAL = "LOCAL"
}

export declare enum Errors {
    CALLBACK_ACCESS_DENIED = "Callback request beneficiary denied access to their data",
    CALLBACK_ACCESS_CODE_MISSING = "Callback request is missing the CODE query parameter",
    CALLBACK_STATE_MISSING = "Callback request is missing the STATE query parameter",
    CALLBACK_STATE_DOES_NOT_MATCH = "Provided callback state does not match AuthData state",
    AUTH_TOKEN_URL_RESPONSE_DATA_MISSING = "Token endpoint response data is missing",
    GET_FHIR_RESOURCE_INALID_AUTH_TOKEN = "Invalid authorization token."
}

/**
 * FHIR end point retry configuration
 */
export declare type RetryConfig = {
    total: number;
    backoffFactor: number;
    statusForcelist: number[];
};

export { }
