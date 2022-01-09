export type Authorization = {
    accessToken: string,
    expiresIn: number,
    tokenType: string,
    scope: [string],
    refreshToken: string,
    patient: string,
    expiresAt: string
}