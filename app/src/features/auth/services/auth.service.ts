import { AxiosInstance } from "axios";
import { authClient } from "./auth.client";
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  MicrosoftSignInRequest,
  ProfileResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  UpdateUserRequest,
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

  async getProfile(): Promise<ProfileResponse> {
    const response = await this.client.get("/profile");
    return response.data;
  }

  async update(data: UpdateUserRequest) {
    return await this.client.patch("/profile", data);
  }

  async changePassword(data: ChangePasswordRequest) {
    return await this.client.put("/profile/change-password", data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.client.post("/password/forgot", data);
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    const response = await this.client.post<ResetPasswordResponse>(
      "/password/reset",
      data,
    );
    return response.data;
  }
}

const authService = new AuthService();
export default authService;
