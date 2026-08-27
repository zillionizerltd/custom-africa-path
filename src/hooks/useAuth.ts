import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff" | "guide" | "customer";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useAuth() {
  const { session, user, loading } = useSession();

  const rolesQuery = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const roles = rolesQuery.data ?? [];

  return {
    session,
    user,
    loading: loading || (!!user && rolesQuery.isLoading),
    roles,
    profile: profileQuery.data ?? null,
    isAdmin: roles.includes("admin"),
    isStaff: roles.includes("admin") || roles.includes("staff"),
    isGuide: roles.includes("guide"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}

export function homeForRoles(roles: AppRole[]): string {
  if (roles.includes("admin") || roles.includes("staff")) return "/admin";
  if (roles.includes("guide")) return "/guide";
  return "/dashboard";
}

export type { User };
