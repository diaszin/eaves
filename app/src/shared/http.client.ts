import axios from "axios";
import type { AxiosInstance, CreateAxiosDefaults } from "axios";

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function createHttpClient(config: CreateAxiosDefaults = {}): AxiosInstance {
  const client = axios.create(config);

  client.interceptors.request.use((request) => {
    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return request;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403 && accessToken) {
        setAccessToken(null);
        unauthorizedHandler?.();
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const httpClient = createHttpClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 5000,
});
