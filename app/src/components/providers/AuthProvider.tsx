import { AuthContext } from "@/hooks/authContext";
import { setAccessToken, setUnauthorizedHandler } from "@/shared/http.client";
import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

const AUTH_STORAGE_KEY = "auth.session";
const SESSION_CHECK_INTERVAL = 60_000;

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

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setAccessToken(null);
      setSession(null);
      setAuthenticated(false);
    }
  }, []);

  const checkSession = useCallback(async () => {
    const storedValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedValue) {
      setAccessToken(null);
      setSession(null);
      setAuthenticated(false);
      return false;
    }

    let storedSession: unknown;
    try {
      storedSession = JSON.parse(storedValue);
    } catch {
      await clearSession();
      return false;
    }

    if (!isStoredSession(storedSession) || storedSession.expiresAt <= Date.now()) {
      await clearSession();
      return false;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode(storedSession.token);
    } catch {
      await clearSession();
      return false;
    }

    if (decoded.exp !== undefined && decoded.exp * 1000 <= Date.now()) {
      await clearSession();
      return false;
    }

    setAccessToken(storedSession.token);
    setSession(decoded);
    setAuthenticated(true);
    return true;
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    setUnauthorizedHandler(() => {
      void clearSession().catch((error: unknown) => {
        console.error("Failed to clear the authentication session", error);
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

        if (!isStoredSession(parsedValue) || parsedValue.expiresAt <= Date.now()) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        try {
          const decoded = jwtDecode(parsedValue.token);
          if (decoded.exp !== undefined && decoded.exp * 1000 <= Date.now()) {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            return;
          }
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
  }, [clearSession]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const runSessionCheck = () => {
      void checkSession().catch((error: unknown) => {
        console.error("Failed to check the authentication session", error);
      });
    };
    const updateCheckInterval = (state: string) => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }

      if (state === "active") {
        runSessionCheck();
        interval = setInterval(runSessionCheck, SESSION_CHECK_INTERVAL);
      } else {
        runSessionCheck();
      }
    };

    updateCheckInterval(AppState.currentState);
    const subscription = AppState.addEventListener("change", updateCheckInterval);

    return () => {
      subscription.remove();
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [checkSession, isLoading]);

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
          await clearSession();
        },
        checkSession,
        session,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
