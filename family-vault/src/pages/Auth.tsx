import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { isSupabaseConfigured } from "../services/supabase";
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const Auth = () => {
  const { 
    signIn, 
    signUp, 
    checkEmailExists, 
    verifySignUpOtp, 
    sendPasswordResetEmail, 
    verifyPasswordResetOtp, 
    updatePassword 
  } = useAuth();
  const { isAuthenticated, loading } = useSession();
  const navigation = useNavigation<any>();

  const [mode, setMode] = useState<"login" | "signup" | "verify_signup" | "forgot_password" | "reset_password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<any>(null);
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigation.replace("Dashboard");
    }
  }, [loading, isAuthenticated, navigation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
        size: asset.fileSize || 0
      });
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("Please fill in email address.");
      return;
    }

    if ((mode === "login" || mode === "signup" || mode === "reset_password") && !password) {
      setError("Please enter a password.");
      return;
    }

    setError(null);
    setBusy(true);
    
    try {
      if (mode === "login") {
        const exists = await checkEmailExists(email);
        if (!exists) {
          setError("Email not found. Please check your email or sign up.");
          setBusy(false);
          return;
        }

        const { error: signInError } = await signIn({ email, password });
        if (signInError) {
          setError("Incorrect password. Please try again.");
        } else { 
          navigation.replace("Dashboard"); 
        }
      } else if (mode === "signup") {
        if (!name || !phone || !photo) {
          setError("Please fill in all fields and select a profile photo.");
          setBusy(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setBusy(false);
          return;
        }

        if (photo.size > 3 * 1024 * 1024) {
          setError("Profile photo must be less than 3MB.");
          setBusy(false);
          return;
        }
        
        const { error: signUpError } = await signUp({ email, password, name, phone, photo: photo as any });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          Alert.alert("Success", "Account created. Please check your email for the verification code.");
          setMode("verify_signup");
        }
      } else if (mode === "verify_signup") {
        if (!otpCode) {
          setError("Please enter the verification code.");
          setBusy(false);
          return;
        }
        const { error: verifyError } = await verifySignUpOtp(email, otpCode);
        if (verifyError) {
          setError(verifyError.message);
        } else {
          Alert.alert("Success", "Account verified successfully!");
          navigation.replace("Dashboard");
        }
      } else if (mode === "forgot_password") {
        const { error: resetError } = await sendPasswordResetEmail(email);
        if (resetError) {
          setError(resetError.message);
        } else {
          Alert.alert("Success", "Verification code sent to your email.");
          setMode("reset_password");
        }
      } else if (mode === "reset_password") {
        if (!otpCode || !confirmPassword) {
          setError("Please fill in all fields.");
          setBusy(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setBusy(false);
          return;
        }
        const { error: verifyError } = await verifyPasswordResetOtp(email, otpCode);
        if (verifyError) {
          setError(verifyError.message);
          setBusy(false);
          return;
        }
        const { error: updateError } = await updatePassword(password);
        if (updateError) {
          setError(updateError.message);
        } else {
          Alert.alert("Success", "Your password has been reset successfully.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          setOtpCode("");
        }
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="shield-check" size={32} color="#fff" />
          </View>
          <Text style={appNameStyle()}>Smart Docs</Text>
          <Text style={styles.appSubtitle}>Your family's documents, safely organized.</Text>
        </View>

        {!isSupabaseConfigured && (
          <View style={styles.warningCard}>
            <Feather name="alert-circle" size={20} color="#92400e" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Supabase not configured</Text>
              <Text style={styles.warningText}>Please check your environment variables.</Text>
            </View>
          </View>
        )}

        <View style={styles.authCard}>
          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {(mode === "login" || mode === "signup") && (
            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, mode === "login" && styles.activeTab]}
                onPress={() => { setMode("login"); setError(null); }}
              >
                <Text style={[styles.tabText, mode === "login" && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, mode === "signup" && styles.activeTab]}
                onPress={() => { setMode("signup"); setError(null); }}
              >
                <Text style={[styles.tabText, mode === "signup" && styles.activeTabText]}>Sign up</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.form}>
            {mode === "signup" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput 
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter full name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput 
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Profile Photo (Max 3MB)</Text>
                  <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <Feather name="image" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.photoButtonText}>
                      {photo ? "Photo Selected" : "Choose Profile Photo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mode !== "verify_signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={mode !== "reset_password"}
                />
              </View>
            )}

            {(mode === "verify_signup" || mode === "reset_password") && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code (6-digit OTP)</Text>
                <TextInput 
                  style={styles.input}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            {(mode === "login" || mode === "signup" || mode === "reset_password") && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{mode === "reset_password" ? "New Password" : "Password"}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput 
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={mode === "reset_password" ? "Enter new password" : "Enter password"}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(mode === "signup" || mode === "reset_password") && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{mode === "reset_password" ? "Confirm New Password" : "Confirm Password"}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput 
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={mode === "reset_password" ? "Confirm new password" : "Confirm password"}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === "login" && (
              <TouchableOpacity 
                onPress={() => { setMode("forgot_password"); setError(null); }}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, busy && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === "login" && "Login"}
                  {mode === "signup" && "Create account"}
                  {mode === "verify_signup" && "Verify Code"}
                  {mode === "forgot_password" && "Send Verification Code"}
                  {mode === "reset_password" && "Reset Password"}
                </Text>
              )}
            </TouchableOpacity>

            {mode !== "login" && mode !== "signup" && (
              <TouchableOpacity 
                onPress={() => { setMode("login"); setError(null); setOtpCode(""); }}
                style={styles.backToLoginLink}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const appNameStyle = () => ({
  fontSize: 28,
  fontWeight: 'bold',
  color: '#0F172A',
} as const);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  warningTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    marginTop: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  backToLoginLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default Auth;
