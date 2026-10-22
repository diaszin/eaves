import { useSession } from "./useSession";

interface AuthProfile {
  sub: number;
  profile: {
    name: string;
  };
}

export function useAuth(): AuthProfile | null {
  const session = useSession();

  if (!session.session && !session.isAuthenticated) {
    return null;
  }

  const payload = session.session as any;

  return {
    sub: payload["sub"],
    profile: {
      name: payload["profile"]["fullname"]
    }
  };
}
