export interface MicrosoftSigningKey {
  kid: string;
  kty: string;
  n: string;
  e: string;
}

export interface MicrosoftIdTokenClaims {
  aud: string;
  exp: number;
  iss: string;
  nbf?: number;
  tid: string;
  sub: string;
  email?: string;
  preferred_username?: string;
}