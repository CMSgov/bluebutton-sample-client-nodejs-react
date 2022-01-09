export interface IAuthorizationToken {
  accessToken: string,
  expiresIn: number,
  tokenType: string,
  scope: [string],
  refreshToken: string,
  patient: string,
  expiresAt: number
}

export default class AuthorizationToken implements IAuthorizationToken {
  public accessToken: string;

  public expiresIn: number;

  public expiresAt: number;

  public tokenType: string;

  public scope: [string];

  public refreshToken: string;

  public patient: string;

  constructor(authToken: any) {
    this.accessToken = authToken.access_token;
    this.expiresIn = authToken.expires_in;
    this.expiresAt = authToken.expires_at;
    this.patient = authToken.patient;
    this.refreshToken = authToken.refresh_token;
    this.scope = authToken.scope;
    this.tokenType = authToken.token_type;
  }
}
