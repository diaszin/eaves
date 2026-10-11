interface PersonalStepData {
  fullname: string;
  document: string; // CPF do usuário
  race: string;
  incomeBraket: string;
  birthDate: Date;
}

interface CommunicationStepData {
  emergencyPhone: string;
  localization: string;
}

interface AuthStepData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MultiStepData {
  personal: PersonalStepData;
  communication: CommunicationStepData;
  auth: AuthStepData;
}
