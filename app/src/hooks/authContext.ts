import { JwtPayload } from "jwt-decode";
import { createContext } from "react";

type AuthContextType = {
  signIn: (token: string, expiresIn: number) => Promise<void>;
  signOut: () => Promise<void>;
  session?: JwtPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  session: null,
  isAuthenticated: false,
  isLoading: true,
});