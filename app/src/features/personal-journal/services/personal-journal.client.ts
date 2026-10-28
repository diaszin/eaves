import { createHttpClient, httpClient } from "@/shared/http.client";

export const personalJournalClient = createHttpClient({
  baseURL: httpClient.defaults.baseURL + "/personal-journal",
});
