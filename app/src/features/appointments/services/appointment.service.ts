import { AxiosInstance } from "axios";
import { appointmentsClient, scheduleClient } from "./appointment.client";
import {
  Appointment,
  CalendarPeriod,
  CreateAppointmentRequest,
} from "./appointment.type";

export class AppointmentService {
  private schedule: AxiosInstance = scheduleClient;
  private appointments: AxiosInstance = appointmentsClient;

  public async getCalendar(
    trainerId: number,
    date: Date,
  ): Promise<CalendarPeriod[]> {
    const response = await this.schedule.get(`/user/${trainerId}/slots`, {
      params: {
        date: date.toISOString(),
      },
    });

    return response.data;
  }

  public async create(data: CreateAppointmentRequest): Promise<void> {
    await this.appointments.post("/", data);
  }

  public async get(): Promise<Appointment[]> {
    const response = await this.appointments.get("/");

    return response.data;
  }
}

const appointmentService = new AppointmentService();

export default appointmentService;
