import { httpClient } from "@/shared/http.client";

export const authClient = httpClient.create({
  baseURL: httpClient.defaults.baseURL + "/auth",
});


