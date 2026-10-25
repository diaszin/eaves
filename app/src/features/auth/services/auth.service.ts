import { AxiosInstance } from "axios";
import { authClient } from "./auth.client";
import {
  MicrosoftSignInRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
} from "./auth.type";

class AuthService {
  private client: AxiosInstance = authClient;

  async login(data: SignInRequest): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>("/login", data);
    return response.data;
  }

  async loginWithMicrosoft(
    data: MicrosoftSignInRequest,
  ): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>("/microsoft", data);
    return response.data;
  }

  async signup(data: SignUpRequest) {
    return await this.client.post("/signup", data);
  }

  async verifyAccount(data: MicrosoftSignInRequest) {
    return await this.client.post("/verify-account", data);
  }
}

const authService = new AuthService();
export default authService;
