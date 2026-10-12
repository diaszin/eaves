import { AuthContext } from "@/hooks/authContext";
import { setAccessToken, setUnauthorizedHandler } from "@/shared/http.client";
import { useEffect, useState, type PropsWithChildren } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setSession(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          try {
            const decoded = jwtDecode(token);
            setAccessToken(token);
            setSession(decoded);
            setAuthenticated(true);
          } catch {
            setAccessToken(null);
            setSession(null);
          }
        },
        signOut: () => {
          setAccessToken(null);
          setSession(null);
        },
        session: session,
        isAuthenticated: isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
