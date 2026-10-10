export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  fullname: string;
  birthDate: Date;
}

export interface SignInRequest {
  email: string;
  password: string;
}
