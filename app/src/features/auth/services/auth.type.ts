export interface SignUpRequest {
  email: string;
  password: string;
  fullname: string;
  birthDate: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}
