import { AxiosInstance } from "axios";
import { authClient } from "./auth.client";
import { SignInRequest, SignUpRequest } from "./auth.type";

class AuthService {
  private client: AxiosInstance = authClient;

  async login(data: SignInRequest) {
    return await this.client.post("/login", data);
  }

  async signup(data: SignUpRequest) {
    return await this.client.post("/signup", data);
  }
}

const authService = new AuthService();
export default authService;
