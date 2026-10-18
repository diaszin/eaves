import { AxiosInstance } from "axios";
import { authClient } from "./auth.client";
import {
  MicrosoftSignInRequest,
  SignInRequest,
  SignUpRequest,
} from "./auth.type";

class AuthService {
  private client: AxiosInstance = authClient;

  async login(data: SignInRequest) {
    return await this.client.post("/login", data);
  }

  async loginWithMicrosoft(data: MicrosoftSignInRequest) {
    return await this.client.post("/microsoft", data);
  }

  async signup(data: SignUpRequest) {
    return await this.client.post("/signup", data);
  }
}

const authService = new AuthService();
export default authService;
