/*
* DEVELOPER NOTES:
* Copy this file and rename it to config.js
* Replace your client/secret/callback url for each environment below with your specific app details
* (Note: local is mainly for BB2 internal developers)
*/
export type ConfigType = {
    [env: string]: {
        bb2BaseUrl: string,
        bb2ClientId: string,
        bb2ClientSecret: string,
        bb2CallbackUrl: string
    }
}

const config: ConfigType = {
    production: {
        bb2BaseUrl: 'https://api.bluebutton.cms.gov',
        bb2ClientId: '<client-id>',
        bb2ClientSecret: '<client-secret>',
        bb2CallbackUrl: '<only https is supported in prod>'
    },
    sandbox: {
        bb2BaseUrl: 'https://sandbox.bluebutton.cms.gov',
        bb2ClientId: '<client-id>',
        bb2ClientSecret: '<client-secret>',
        bb2CallbackUrl: 'http://localhost:3001/api/bluebutton/callback/'
    },
    local: {
        bb2BaseUrl: 'https://sandbox.bluebutton.cms.gov',
        bb2ClientId: '<client-id>',
        bb2ClientSecret: '<client-secret>',
        bb2CallbackUrl: 'http://localhost:3001/api/bluebutton/callback/'
    }
}

export default config;