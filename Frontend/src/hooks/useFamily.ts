import { useCallback, useEffect, useState } from "react";
import { supabase, type FamilyMember } from "../services/supabase";
import { useAuth } from "./useAuth";

export const useFamily = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setMembers((data ?? []) as FamilyMember[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (input: { name: string; }) => {
    if (!user) return { error: new Error("Not signed in") };
    const { error } = await supabase.from("family_members").insert({
      user_id: user.id,
      name: input.name,
    });
    if (!error) await fetchMembers();
    return { error };
  };

  const updateMember = async (id: string, patch: Partial<Pick<FamilyMember, "name">>) => {
    const { error } = await supabase.from("family_members").update(patch).eq("id", id);
    if (!error) await fetchMembers();
    return { error };
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from("family_members").delete().eq("id", id);
    if (!error) await fetchMembers();
    return { error };
  };

  return { members, loading, error, fetchMembers, addMember, updateMember, deleteMember };
};
