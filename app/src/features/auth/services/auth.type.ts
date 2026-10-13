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
