import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';

const cropImageWeb = (imageUri: string, zoom: number, offsetX: number, offsetY: number) => {
  return new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.src = imageUri;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      const minDimension = Math.min(img.width, img.height);
      const sWidth = minDimension / zoom;
      const sHeight = minDimension / zoom;
      
      const sx = (img.width - sWidth) / 2 - (offsetX / 200) * sWidth;
      const sy = (img.height - sHeight) / 2 - (offsetY / 200) * sHeight;

      ctx.drawImage(
        img,
        Math.max(0, Math.min(sx, img.width - sWidth)),
        Math.max(0, Math.min(sy, img.height - sHeight)),
        sWidth,
        sHeight,
        0,
        0,
        size,
        size
      );

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (e) => reject(e);
  });
};

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

  const [rawPhotoUri, setRawPhotoUri] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);

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

  const uploadCroppedAvatar = async (uri: string, mimeType: string) => {
    setSaving(true);
    try {
      let extension = uri.split('.').pop()?.split('?')[0].split('#')[0] || 'jpg';
      if (extension.length > 5 || extension.includes(';')) {
        extension = 'jpg';
      }
      
      const fileName = `${user?.id}-${Date.now()}.${extension}`;
      const filePath = fileName;

      const response = await fetch(uri);
      const fileToUpload = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload, {
          upsert: true,
          contentType: mimeType,
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

      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) console.error("Session refresh error:", refreshError);

      Alert.alert("Success", "Profile picture updated! If it doesn't show on other devices, please sign out and sign back in on those devices.");
    } catch (error: any) {
      console.error("Avatar Update Error:", error);
      Alert.alert("Error", error.message || "Failed to update profile picture.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== 'web',
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (Platform.OS === 'web') {
        setRawPhotoUri(asset.uri);
        setCropZoom(1);
        setCropOffsetX(0);
        setCropOffsetY(0);
        setShowCropModal(true);
      } else {
        await uploadCroppedAvatar(asset.uri, asset.mimeType || 'image/jpeg');
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile picture.");
    }
  };

  const handleSaveCrop = async () => {
    if (!rawPhotoUri) return;
    try {
      setSaving(true);
      const croppedUri = await cropImageWeb(rawPhotoUri, cropZoom, cropOffsetX, cropOffsetY);
      await uploadCroppedAvatar(croppedUri, 'image/jpeg');
      setShowCropModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to crop image.");
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
              A 6-digit verification code will be sent to your registered email address.
            </Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleResetPassword}>
              <Text style={styles.outlineBtnText}>Reset Password</Text>
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

      {/* Image Crop Modal (Web only) */}
      <Modal visible={showCropModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crop Profile Picture</Text>
            
            {/* Cropping Preview Area */}
            <View style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              overflow: 'hidden',
              alignSelf: 'center',
              backgroundColor: '#F1F5F9',
              borderWidth: 2,
              borderColor: '#3B82F6',
              marginBottom: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {rawPhotoUri && (
                <Image 
                  source={{ uri: rawPhotoUri }} 
                  style={{
                    width: 200,
                    height: 200,
                    transform: [
                      { scale: cropZoom },
                      { translateX: cropOffsetX },
                      { translateY: cropOffsetY }
                    ]
                  }}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Adjustment Controls */}
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>Adjust Image Position</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setCropOffsetX(x => x - 10)} style={styles.controlBtn}>
                <Feather name="arrow-left" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCropOffsetX(x => x + 10)} style={styles.controlBtn}>
                <Feather name="arrow-right" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCropOffsetY(y => y - 10)} style={styles.controlBtn}>
                <Feather name="arrow-up" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCropOffsetY(y => y + 10)} style={styles.controlBtn}>
                <Feather name="arrow-down" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCropZoom(z => Math.min(z + 0.1, 3))} style={styles.controlBtn}>
                <Feather name="zoom-in" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCropZoom(z => Math.max(z - 0.1, 1))} style={styles.controlBtn}>
                <Feather name="zoom-out" size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setShowCropModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleSaveCrop}>
                <Text style={styles.saveBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default ProfilePage;
