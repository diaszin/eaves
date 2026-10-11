import { JwtPayload } from "jwt-decode";
import { createContext } from "react";

type AuthContextType = {
  signIn: (token: string) => void;
  signOut: () => void;
  session?: JwtPayload | null;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  signIn: (token: string) => null,
  signOut: () => null,
  session: null,
  isAuthenticated: false,
});