import { AxiosInstance } from "axios";
import { appointmentsClient, scheduleClient } from "./appointment.client";
import {
  CalendarPeriod,
  CreateAppointmentRequest,
} from "./appointment.type";

export class AppointmentService {
  private schedule: AxiosInstance = scheduleClient;

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
    await appointmentsClient.post("/", data);
  }
}

const appointmentService = new AppointmentService();

export default appointmentService;
