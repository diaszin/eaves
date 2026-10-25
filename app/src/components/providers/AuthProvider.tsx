import { AuthContext } from "@/hooks/authContext";
import { setAccessToken, setUnauthorizedHandler } from "@/shared/http.client";
import { useEffect, useState, type PropsWithChildren } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_STORAGE_KEY = "auth.session";

type StoredSession = {
  token: string;
  expiresAt: number;
};

function isStoredSession(value: unknown): value is StoredSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    typeof value.token === "string" &&
    "expiresAt" in value &&
    typeof value.expiresAt === "number" &&
    Number.isFinite(value.expiresAt)
  );
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setSession(null);
      setAuthenticated(false);
      void AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch((error: unknown) => {
        console.error(
          "Failed to remove the stored authentication session",
          error,
        );
      });
    });

    async function restoreSession() {
      try {
        const storedValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!storedValue) {
          return;
        }

        let parsedValue: unknown;
        try {
          parsedValue = JSON.parse(storedValue);
        } catch {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        if (
          !isStoredSession(parsedValue) ||
          parsedValue.expiresAt <= Date.now()
        ) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        try {
          const decoded = jwtDecode(parsedValue.token);
          if (!cancelled) {
            setAccessToken(parsedValue.token);
            setSession(decoded);
            setAuthenticated(true);
          }
        } catch {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error(
          "Failed to restore the stored authentication session",
          error,
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (token: string, expiresIn: number) => {
          if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
            throw new Error(
              "The authentication response contains an invalid token TTL.",
            );
          }

          const decoded = jwtDecode(token);
          const expiresAt = Date.now() + expiresIn * 1000;
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ token, expiresAt } satisfies StoredSession),
          );

          setAccessToken(token);
          setSession(decoded);
          setAuthenticated(true);
        },
        signOut: async () => {
          try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          } finally {
            setAccessToken(null);
            setSession(null);
            setAuthenticated(false);
          }
        },
        session,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
