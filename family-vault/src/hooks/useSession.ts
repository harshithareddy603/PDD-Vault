import { useAuth } from "./useAuth";

/**
 * Convenience hook for React Native — exposes session state for guards/components.
 * Works seamlessly with the updated useAuth hook.
 */
export const useSession = () => {
  const { session, user, loading } = useAuth();
  return { session, user, loading, isAuthenticated: !!session };
};
