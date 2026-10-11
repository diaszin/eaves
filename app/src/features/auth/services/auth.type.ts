export interface SignUpRequest {
  email: string;
  password: string;
  fullname: string;
  birthDate: Date;
}

export interface SignInRequest {
  email: string;
  password: string;
}
