import { createHttpClient, httpClient } from "@/shared/http.client";

export const surveyClient = createHttpClient({
    baseURL: httpClient.defaults.baseURL + "/survey",
});