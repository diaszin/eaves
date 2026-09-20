import { createContext } from "react";

type AuthContextType = {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isAuthenticated: false,
});