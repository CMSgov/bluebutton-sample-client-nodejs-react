import FormData from 'form-data';
import AuthorizationToken from '../entities/AuthorizationToken';
import db from './db';
import config from '../configs/config';
import { generateCodeChallenge, generateRandomState } from './generatePKCE';
import { post, postWithConfig } from './request';

export function generateAuthorizeUrl(): string {
  const envConfig = config[db.settings.env];

  const BB2_AUTH_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/o/authorize`;

  let pkceParams = '';
  const state = generateRandomState();

  if (db.settings.pkce) {
    const codeChallenge = generateCodeChallenge();
    pkceParams = `${'&code_challenge_method=S256'
            + '&code_challenge='}${codeChallenge.codeChallenge}`;

    db.codeChallenges[state] = codeChallenge;
  }

  return `${BB2_AUTH_URL
  }?client_id=${envConfig.bb2ClientId
  }&redirect_uri=${envConfig.bb2CallbackUrl
  }&state=${state
  }&response_type=code${
    pkceParams}`;
}

export async function getAccessToken(code: string, state: string | undefined) {
  const envConfig = config[db.settings.env];
  const BB2_ACCESS_TOKEN_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/o/token/`;

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
  return post(BB2_ACCESS_TOKEN_URL, form, form.getHeaders());
}

export async function refreshAccessToken(refreshToken: string) {
  const envConfig = config[db.settings.env];

  const BB2_ACCESS_TOKEN_URL = `${envConfig.bb2BaseUrl}/${db.settings.version}/o/token/`;

  const tokenResponse = await postWithConfig({
    method: 'post',
    url: BB2_ACCESS_TOKEN_URL,
    auth: {
      username: envConfig.bb2ClientId,
      password: envConfig.bb2ClientSecret,
    },
    params: {
      grant_type: 'refresh_token',
      client_id: envConfig.bb2ClientId,
      refresh_token: refreshToken,
    },
  });

  return new AuthorizationToken(tokenResponse.data);
}
