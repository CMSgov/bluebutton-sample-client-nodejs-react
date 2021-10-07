export interface ISettings {
    env: string,
    version: string,
    pkce: boolean,
}

export default class Settings implements ISettings {

    public env: string;
    public version: string;
    public pkce: boolean;

    /* DEVELOPER NOTE:
        * to utilize the latest security features/best practices
        * it is recommended to utilize pkce
        * 
        * Default values are hard coded here, but you may choose to store these values in a
        * config file or other mechanism
        * 
        * It's recommended that you use the latest version V2, which utilizes
        * FHIR R4 
        */
    constructor(settings: ISettings | undefined) {
        this.env = settings?.env || 'sandbox';
        this.version = settings?.version || 'v2';
        this.pkce = settings?.pkce != undefined ? settings.pkce : true;
    }
}