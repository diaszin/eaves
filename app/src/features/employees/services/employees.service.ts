import { AxiosInstance } from "axios";
import { employeesClient } from "./employees.client";
import { Employee } from "./employees.type";

export class EmployeesService {
  private readonly client: AxiosInstance = employeesClient;

  public async getTrainers(): Promise<Employee[]> {
    const response = await this.client.get("", {
      params: {
        role: "trainee",
      },
    });
    return response.data;
  }
}

const employeesService = new EmployeesService();

export default employeesService;
