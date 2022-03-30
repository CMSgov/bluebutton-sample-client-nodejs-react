import { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';

declare module 'cms-bluebutton' {

export declare type AuthData = {
    codeChallenge: string;
    verifier: string;
    state: string;
};

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

declare type AuthorizationTokenData = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string[];
    refresh_token: string;
    patient: string;
    expires_at?: number;
};

declare class BlueButton {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    version: string;
    baseUrl: string;
    constructor(config?: BlueButtonConfig);
    normalizeConfig(config: BlueButtonJsonConfig): {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
        version: string;
        baseUrl: string;
    };
    getExplanationOfBenefitData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any> | undefined;
    }>;
    getPatientData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any> | undefined;
    }>;
    getCoverageData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any> | undefined;
    }>;
    getProfileData(authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any> | undefined;
    }>;
    getCustomData(path: string, authToken: AuthorizationToken, config?: AxiosRequestConfig): Promise<{
        token: AuthorizationToken;
        response: AxiosResponse<any, any> | undefined;
    }>;
    generateAuthData(): AuthData;
    generateAuthorizeUrl(authData: AuthData): string;
    getAuthorizationToken(authData: AuthData, callbackRequestCode?: string, callbackRequestState?: string, callbackRequestError?: string): Promise<AuthorizationToken>;
}
export default BlueButton;

declare type BlueButtonConfig = string | BlueButtonJsonConfig;

declare type BlueButtonJsonConfig = {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    version?: string;
    environment?: Environments;
};

declare enum Environments {
    PRODUCTION = "PRODUCTION",
    SANDBOX = "SANDBOX"
}
}