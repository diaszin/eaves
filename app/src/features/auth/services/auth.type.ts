export interface SignUpRequest {
  email: string;
  password: string;
  fullname: string;
  birthDate: string;
  document: string;
  race: string;
  incomeBraket: string;
  emergencyPhone: string;
  cep: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
  expires: number;
}
export interface MicrosoftSignInRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  role: string;
  profile: {
    fullname: string;
    birthDate: string;
    document: string;
    race: string;
    incomeBraket: string;
    emergencyPhone: string;
    cep: string;
  };
}

export interface UpdateUserRequest {
  email?: string;
  fullname?: string;
  birthDate?: string;
  document?: string;
  race?: string;
  incomeBraket?: string;
  emergencyPhone?: string;
  cep?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  mfaRequired: boolean;
}
