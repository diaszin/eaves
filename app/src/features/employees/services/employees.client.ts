import { createHttpClient, httpClient } from "@/shared/http.client";

export const employeesClient = createHttpClient({
    baseURL: httpClient.defaults.baseURL + "/employees",
})