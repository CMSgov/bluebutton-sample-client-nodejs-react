import axios from 'axios';
import FormData from 'form-data';

import db from './db';
import config from '../configs/config';
import { generateCodeChallenge, generateRandomState } from './generatePKCE';

export function generateAuthorizeUrl(): string {
    const envConfig = config[db.settings.env];

    const BB2_AUTH_URL = envConfig.bb2BaseUrl + '/' + db.settings.version + '/o/authorize';

    let pkceParams = '';
    const state = generateRandomState();

    if (db.settings.pkce) {
        const codeChallenge = generateCodeChallenge();
        pkceParams = '&code_challenge_method=S256' + 
            '&code_challenge=' + codeChallenge.codeChallenge;
        
        db.codeChallenges[state] = codeChallenge;
    }

    return BB2_AUTH_URL +
        '?client_id=' + envConfig.bb2ClientId + 
        '&redirect_uri=' + envConfig.bb2CallbackUrl +
        '&state=' + state +
        '&response_type=code' +
        pkceParams;
}

export async function getAccessToken(code: string, state: string | undefined) {
    const envConfig = config[db.settings.env];

    const BB2_ACCESS_TOKEN_URL = envConfig.bb2BaseUrl + '/' + db.settings.version + '/o/token/';

    const form = new FormData();
    form.append('client_id', envConfig.bb2ClientId);
    form.append('client_secret', envConfig.bb2ClientSecret);
    form.append('code', code);
    form.append('grant_type', 'authorization_code');
    form.append('redirect_uri', envConfig.bb2CallbackUrl);

    if (db.settings.pkce && state) {
        const codeChallenge = db.codeChallenges[state];
        form.append('code_verifier', codeChallenge.verifier);
        form.append('code_challenge', codeChallenge.codeChallenge);
    }
    return await axios.post(BB2_ACCESS_TOKEN_URL, form, { headers: form.getHeaders() });
}