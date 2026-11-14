import { createHttpClient, httpClient } from "@/shared/http.client";

export const appointmentsClient = createHttpClient({
  baseURL: httpClient.defaults.baseURL + "/appointments",
});

export const scheduleClient = createHttpClient({
  baseURL: httpClient.defaults.baseURL + "/schedules",
});