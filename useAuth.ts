import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface User {
  id: number;
  name: string | null;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  
  const getCurrentUserQuery = trpc.emailAuth.getCurrentUser.useQuery(undefined, {
    retry: false,
    staleTime: 0, // Ensure we check every time the component mounts
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setUser(null);
      navigate("/", { replace: true });
    },
  });

  useEffect(() => {
    if (getCurrentUserQuery.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
      if (getCurrentUserQuery.data) {
        setUser(getCurrentUserQuery.data as User);
      } else {
        setUser(null);
      }
    }
  }, [getCurrentUserQuery.data, getCurrentUserQuery.isLoading]);

  const checkAuth = useCallback(async () => {
    await getCurrentUserQuery.refetch();
    return getCurrentUserQuery.data || null;
  }, [getCurrentUserQuery]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return { 
    user, 
    loading, 
    logout, 
    checkAuth,
    isAuthenticated: !!user 
  };
}
