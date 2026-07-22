import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';

const ProfilePage = () => {
  const { user, signOut, sendPasswordResetEmail, verifyPasswordResetOtp, updatePassword } = useAuth();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.name || user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
      setBloodGroup(user.user_metadata.blood_group || "");
      setAddress(user.user_metadata.address || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name, phone, full_name: name, blood_group: bloodGroup, address }
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      setSaving(true);
      const asset = result.assets[0];

      // Check file size (limit to 3MB)
      if (asset.fileSize && asset.fileSize > 3 * 1024 * 1024) {
        Alert.alert("Image Too Large", "Please select an image smaller than 3MB.");
        setSaving(false);
        return;
      }

      // Fix for web: some browsers return base64 instead of a file extension
      let extension = asset.uri.split('.').pop()?.split('?')[0].split('#')[0] || 'jpg';
      if (extension.length > 5 || extension.includes(';')) {
        extension = 'jpg'; // Fallback for base64 data URIs
      }
      
      const fileName = `${user?.id}-${Date.now()}.${extension}`;
      const filePath = fileName;

      let fileToUpload;
      if (Platform.OS === 'web') {
        // For web, we can fetch the blob directly from the URI
        const response = await fetch(asset.uri);
        fileToUpload = await response.blob();
      } else {
        // For mobile, we use the URI directly or convert to blob
        const response = await fetch(asset.uri);
        fileToUpload = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload, {
          upsert: true,
          contentType: asset.mimeType || 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // Force refresh and get latest user data from server
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) console.error("Session refresh error:", refreshError);
      
      console.log("Avatar updated successfully. New URL:", publicUrl);
      console.log("Current user metadata:", refreshData.user?.user_metadata);

      Alert.alert("Success", "Profile picture updated! If it doesn't show on other devices, please sign out and sign back in on those devices.");
    } catch (error: any) {
      console.error("Avatar Update Error:", error);
      Alert.alert("Error", error.message || "Failed to update profile picture. Ensure the 'avatars' bucket exists in Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setSaving(true);
    const { error } = await sendPasswordResetEmail(user.email);
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Verification code sent to your email.");
      setShowResetModal(true);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetOtpCode || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!user?.email) return;

    setResetBusy(true);
    try {
      const { error: verifyError } = await verifyPasswordResetOtp(user.email, resetOtpCode);
      if (verifyError) {
        Alert.alert("Error", verifyError.message);
        setResetBusy(false);
        return;
      }

      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        Alert.alert("Error", updateError.message);
      } else {
        Alert.alert("Success", "Your password has been reset successfully.");
        setShowResetModal(false);
        setResetOtpCode("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to reset password.");
    } finally {
      setResetBusy(false);
    }
  };

  const userInitials = (name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.user_metadata?.avatar_url ? (
              <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={96} label={userInitials} style={styles.avatarFallback} labelStyle={styles.avatarLabel} />
            )}
            <TouchableOpacity 
              style={styles.changePhotoBadge} 
              onPress={handleUpdateAvatar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.profileSummary}>
            <Text style={styles.userName}>{name || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="user" size={18} color="#3b82f6" />
              <Text style={styles.cardTitle}>Profile Details</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={name}
                onChangeText={setName}
                editable={isEditing}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Group (optional)</Text>
              <TextInput 
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={bloodGroup}
                onChangeText={setBloodGroup}
                editable={isEditing}
                placeholder="e.g. O+"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address (optional)</Text>
              <TextInput 
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={address}
                onChangeText={setAddress}
                editable={isEditing}
                multiline
              />
            </View>

            {isEditing && (
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setIsEditing(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="shield" size={18} color="#3b82f6" />
              <Text style={styles.cardTitle}>Security</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.infoText}>
              A password reset link will be sent to your registered email address.
            </Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleResetPassword}>
              <Text style={styles.outlineBtnText}>Send Password Reset Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.1</Text>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Feather name="log-out" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Zoom Modal */}
      <Modal visible={showImageModal} transparent={true} animationType="fade">
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setShowImageModal(false)}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          {user?.user_metadata?.avatar_url ? (
            <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.zoomedImage} resizeMode="contain" />
          ) : (
            <View style={styles.zoomedAvatarFallback}>
              <Text style={styles.zoomedAvatarText}>{userInitials}</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Password Reset Verification Modal */}
      <Modal visible={showResetModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <ScrollView style={{ marginBottom: 12 }} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput 
                  style={styles.input} 
                  value={resetOtpCode} 
                  onChangeText={setResetOtpCode} 
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput 
                  style={styles.input} 
                  value={newPassword} 
                  onChangeText={setNewPassword} 
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput 
                  style={styles.input} 
                  value={confirmNewPassword} 
                  onChangeText={setConfirmNewPassword} 
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setShowResetModal(false)}
                  disabled={resetBusy}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={handleConfirmResetPassword}
                  disabled={resetBusy}
                >
                  {resetBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  avatarFallback: {
    backgroundColor: '#3b82f6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileSummary: {
    alignItems: 'center',
    marginTop: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  editBtnText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  outlineBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  version: {
    fontSize: 12,
    color: '#94A3B8',
  },
  signOutBtn: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeImageBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  zoomedImage: {
    width: '100%',
    height: '80%',
  },
  zoomedAvatarFallback: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomedAvatarText: {
    fontSize: 80,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
});

export default ProfilePage;
