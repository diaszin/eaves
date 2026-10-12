import { createHttpClient, httpClient } from "@/shared/http.client";

export const authClient = createHttpClient({
  baseURL: httpClient.defaults.baseURL + "/auth",
});


