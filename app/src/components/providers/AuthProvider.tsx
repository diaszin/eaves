import { AuthContext } from "@/hooks/authContext";
import { useState, type PropsWithChildren } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<JwtPayload | null>(null);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          try {
            const decoded = jwtDecode(token);
            setSession(decoded);
          } catch {
            setSession(null);
          }
        },
        signOut: () => setSession(null),
        session: session,
        isAuthenticated: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
