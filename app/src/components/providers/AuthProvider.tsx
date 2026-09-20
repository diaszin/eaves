import { AuthContext } from "@/hooks/authContext";
import { useState, type PropsWithChildren } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        signIn: () => null,
        signOut: () => setSession(null),
        session: session,
        isAuthenticated: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
