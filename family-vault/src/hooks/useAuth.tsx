import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { SplashScreen } from "@/components/SplashScreen";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (input: { email: string; password: string; name: string; phone?: string; photo: File }) => Promise<{ error: Error | null }>;
  signIn: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  verifySignUpOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Subscribe FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    // 2) Then load existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ email, password, name, phone, photo }) => {
    // photo in RN is { uri, name, type }
    const fileExt = (photo as any).name ? (photo as any).name.split('.').pop() : 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    let fileToUpload;
    try {
      const response = await fetch((photo as any).uri);
      fileToUpload = await response.blob();
    } catch (e) {
      console.error("Failed to fetch photo blob, using raw photo object as fallback:", e);
      fileToUpload = photo;
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileToUpload, {
        contentType: (photo as any).type || `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) {
      return { error: new Error(`Failed to upload photo: ${uploadError.message}`) };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone: phone ?? "", avatar_url: publicUrl },
      },
    });
    return { error: error as Error | null };
  }, []);

  const signIn: AuthCtx["signIn"] = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const checkEmailExists = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', { email_to_check: email });
      if (error) {
        console.error("Error checking email existence:", error);
        return true; // Fallback to true to allow attempt if check fails
      }
      return !!data;
    } catch (e) {
      console.error("Exception checking email existence:", e);
      return true;
    }
  }, []);

  const verifySignUpOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    return { error: error as Error | null };
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error as Error | null };
  }, []);

  const verifyPasswordResetOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });
    return { error: error as Error | null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    });
    return { error: error as Error | null };
  }, []);

  return (
    <Ctx.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      signUp,
      signIn,
      signOut,
      checkEmailExists,
      verifySignUpOtp,
      sendPasswordResetEmail,
      verifyPasswordResetOtp,
      updatePassword
    }}>
      {loading ? <SplashScreen /> : children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};
