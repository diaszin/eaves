import { useSession } from "./useSession";

export function useAuth() {
  const session = useSession();

  if (!session.session && !session.isAuthenticated) {
    return null;
  }

  return session.session;
}
