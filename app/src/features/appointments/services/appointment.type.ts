export interface CalendarPeriod {
  id: number;
  dayOfWeek: number;
  customDate: string | null;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  maxCapacity: number;
}

export interface CreateAppointmentRequest {
  initialDate: string;
  professionalId: number;
}

export interface AppointmentProfile {
  id: number;
  email: string;
  role: string;
  profile: {
    fullname: string;
    emergencyPhone: string;
    birthday: Date;
  };
}

export interface Appointment {
  id: number;
  initialDate: Date;
  endDate: Date;
  createdBy: AppointmentProfile;
  patient: AppointmentProfile;
  professional: AppointmentProfile;
}
