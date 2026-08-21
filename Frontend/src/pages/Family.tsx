/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useFamily } from '../hooks/useFamily';
import { useDocumentsWithCache } from '../hooks/useDocumentsWithCache';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox, ProgressBar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { performLocalOCR } from '../services/ocrService';

import { useTheme } from '../context/ThemeContext';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { AnimatedCard } from '../components/animations/AnimatedComponents';

const CATEGORIES = ["ID", "Certificate", "Insurance", "Medical", "License", "Resume", "Passport", "Education", "Property", "Other"];

const Family = () => {
  const { user } = useAuth();
  const { members, loading, addMember, updateMember, deleteMember } = useFamily();
  const {
    documents,
    addDocument,
    deleteDocument,
    openDocumentFile,
    downloadFileToDevice,
    uploadProgress
  } = useDocumentsWithCache();

  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  // Family Member Add/Edit state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Viewing Member Profile state
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Add Document state for a specific Family Member
  const [addDocMemberId, setAddDocMemberId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('ID');
  const [docExpiry, setDocExpiry] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docFile, setDocFile] = useState<any | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [scanningDoc, setScanningDoc] = useState(false);

  const isWeb = Platform.OS === 'web';

  const resetMemberForm = () => {
    setName('');
    setEditingId(null);
    setTermsAccepted(false);
  };

  const resetDocForm = () => {
    setDocName('');
    setDocCategory('ID');
    setDocExpiry('');
    setDocNumber('');
    setDocFile(null);
    setUploadingDoc(false);
    setScanningDoc(false);
  };

  const submitMember = async () => {
    if (!termsAccepted) {
      if (isWeb) alert('Please accept the terms to continue.');
      else Alert.alert('Error', 'Please accept the terms to continue.');
      return;
    }
    const payload = { name };
    const { error } = editingId
      ? await updateMember(editingId, payload)
      : await addMember(payload);

    if (error) {
      if (isWeb) alert(error.message);
      else Alert.alert('Error', error.message);
    } else {
      if (isWeb) alert(editingId ? 'Member updated successfully' : 'Member added successfully');
      else Alert.alert('Success', editingId ? 'Member updated' : 'Member added');
      setOpen(false);
      resetMemberForm();
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setTermsAccepted(true);
    setOpen(true);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (isWeb) {
      if (window.confirm(`Are you sure you want to remove ${name}?`)) {
        deleteMember(id);
      }
    } else {
      Alert.alert('Remove Member', `Are you sure you want to remove ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteMember(id) },
      ]);
    }
  };

  // --- Document Picker & Camera Scan for Family Member ---
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets[0];
        setDocFile(picked);
        if (!docName) {
          const nameWithoutExt = picked.name.replace(/\.[^/.]+$/, "");
          setDocName(nameWithoutExt);
        }
      }
    } catch (err) {
      console.warn("Document picker error:", err);
    }
  };

  const handleScanDocument = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (isWeb) alert("Camera permission is required to scan documents.");
        else Alert.alert("Permission Denied", "Camera permission is required to scan documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const timestamp = new Date().getTime();
        const scannedName = `Scan_${timestamp}`;
        const scannedFile = {
          uri: asset.uri,
          name: `${scannedName}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0
        };
        setDocFile(scannedFile);
        setDocName(scannedName);
        setScanningDoc(true);

        // Run OCR on scanned document
        try {
          const ocr = await performLocalOCR(asset.uri, scannedFile.name);
          if (ocr) {
            if (ocr.name) setDocName(ocr.name);
            if (ocr.appCategory && CATEGORIES.includes(ocr.appCategory)) {
              setDocCategory(ocr.appCategory);
            }
            if (ocr.expiryDate) setDocExpiry(ocr.expiryDate);
            if (ocr.documentNumber) setDocNumber(ocr.documentNumber);
          }
        } catch (ocrErr) {
          console.warn("OCR scanning error:", ocrErr);
        } finally {
          setScanningDoc(false);
        }
      }
    } catch (err) {
      if (isWeb) alert("Failed to open camera.");
      else Alert.alert("Error", "Failed to open camera.");
      setScanningDoc(false);
    }
  };

  const handleSaveDocForMember = async (memberId: string) => {
    if (!docName.trim()) {
      if (isWeb) alert("Please enter a document title.");
      else Alert.alert("Error", "Please enter a document title.");
      return;
    }
    if (!docFile) {
      if (isWeb) alert("Please pick or scan a file first.");
      else Alert.alert("Error", "Please pick or scan a file first.");
      return;
    }

    setUploadingDoc(true);
    const { error } = await addDocument({
      name: docName.trim(),
      category: docCategory,
      expiry_date: docExpiry ? docExpiry : null,
      document_number: docNumber ? docNumber : null,
      family_member_id: memberId,
      file: docFile,
    });

    setUploadingDoc(false);

    if (error) {
      if (isWeb) alert("Failed to add document: " + error.message);
      else Alert.alert("Error", "Failed to add document: " + error.message);
    } else {
      if (isWeb) alert("Document saved successfully to member vault!");
      else Alert.alert("Success", "Document saved successfully to member vault!");
      setAddDocMemberId(null);
      resetDocForm();
    }
  };

  const handleDeleteDocument = (docId: string, docTitle: string) => {
    if (isWeb) {
      if (window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
        deleteDocument(docId);
      }
    } else {
      Alert.alert("Delete Document", `Are you sure you want to delete "${docTitle}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteDocument(docId) },
      ]);
    }
  };

  // Get current user details for the Owner card
  const ownerName = (user?.user_metadata?.name as string | undefined) || 'Harshitha Reddy';
  const ownerEmail = user?.email || 'harshitha.reddy@example.com';
  const ownerInitials = ownerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const ownerDocsCount = documents.filter((d) => !d.family_member_id).length;

  return (
    <AppLayout>
      <View style={s.container}>
        {/* Header Row */}
        <View style={s.headerRow}>
          <View>
            <Text style={[s.pageTitle, { color: colors.text }]}>Family Management</Text>
            <Text style={[s.subtitle, { color: colors.subtext }]}>{members.length + 1} family members</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
            <Feather name="plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={s.addBtnText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={s.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <View style={s.grid}>
            {/* 1. Owner Card */}
            <AnimatedCard index={0} style={{ width: Platform.OS === 'web' ? '31.5%' : '100%', minWidth: 260 }}>
              <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}>
                <View style={[s.pill, s.ownerPill]}>
                  <Text style={s.ownerPillText}>owner</Text>
                </View>

                <View style={s.cardContent}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{ownerInitials}</Text>
                  </View>

                  <Text style={[s.memberName, { color: colors.text }]} numberOfLines={1}>
                    {ownerName}
                  </Text>
                  <Text style={[s.memberEmail, { color: colors.subtext }]} numberOfLines={1}>
                    {ownerEmail}
                  </Text>

                  <View style={s.bottomRow}>
                    <Text style={[s.docsCount, { color: colors.subtext }]}>{ownerDocsCount} documents</Text>
                    <TouchableOpacity onPress={() => navigation?.navigate('Profile' as any)}>
                      <Text style={s.linkText}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </AnimatedCard>

            {/* 2. Family Members Cards */}
            {members.map((m, idx) => {
              const initials = m.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const email = `${m.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
              const mDocs = documents.filter((d) => d.family_member_id === m.id);

              return (
                <AnimatedCard key={m.id} index={idx + 1} style={{ width: Platform.OS === 'web' ? '31.5%' : '100%', minWidth: 260 }}>
                  <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}>
                    <View style={s.cardTopBar}>
                      <View style={[s.pill, s.familyPill, isDark && { backgroundColor: '#1e3a8a' }]}>
                        <Text style={[s.familyPillText, isDark && { color: '#93c5fd' }]}>family</Text>
                      </View>
                      <View style={s.actions}>
                        <TouchableOpacity
                          onPress={() => startEdit(m.id, m.name)}
                          style={s.miniBtn}
                        >
                          <Feather name="edit-2" size={12} color={colors.subtext} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteMember(m.id, m.name)}
                          style={s.miniBtn}
                        >
                          <Feather name="trash-2" size={12} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={s.cardContent}>
                      <View style={s.avatar}>
                        <Text style={s.avatarText}>{initials}</Text>
                      </View>

                      <Text style={[s.memberName, { color: colors.text }]} numberOfLines={1}>
                        {m.name}
                      </Text>
                      <Text style={[s.memberEmail, { color: colors.subtext }]} numberOfLines={1}>
                        {email}
                      </Text>

                      <View style={s.bottomRow}>
                        <Text style={[s.docsCount, { color: colors.subtext }]}>{mDocs.length} documents</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            style={s.addDocSmallBtn}
                            onPress={() => {
                              resetDocForm();
                              setAddDocMemberId(m.id);
                            }}
                          >
                            <Feather name="plus" size={12} color="#FFFFFF" />
                            <Text style={s.addDocSmallBtnText}>Add Doc</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setViewingId(m.id)}>
                            <Text style={s.linkText}>View Vault</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </AnimatedCard>
              );
            })}
          </View>
        )}
      </View>

      {/* Add/Edit Family Member Modal */}
      <Modal visible={open} animationType="slide" transparent={true} onRequestClose={() => setOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Family Member' : 'Add Family Member'}</Text>
            <View style={s.inputGroup}>
              <Text style={[s.label, { color: colors.subtext }]}>Full Name</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={s.termsContainer}>
              <Checkbox.Android
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setTermsAccepted(!termsAccepted)}
                color="#3B82F6"
              />
              <Text style={[s.termsText, { color: colors.subtext }]}>
                Please save correct details to easily manage family member documents.
              </Text>
            </View>
            <TouchableOpacity
              style={[s.saveButton, !termsAccepted && s.disabledButton]}
              onPress={submitMember}
              disabled={!termsAccepted}
            >
              <Text style={s.saveButtonText}>{editingId ? 'Save Changes' : 'Add Member'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelButton} onPress={() => { setOpen(false); resetMemberForm(); }}>
              <Text style={[s.cancelButtonText, { color: colors.subtext }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Member Document Vault Viewer Modal */}
      <Modal visible={!!viewingId} animationType="slide" transparent={true} onRequestClose={() => setViewingId(null)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.modalBg, borderColor: colors.border, maxWidth: 520 }]}>
            {(() => {
              const m = members.find((x) => x.id === viewingId);
              const mDocs = documents.filter((d) => d.family_member_id === viewingId);
              return (
                <View>
                  <View style={s.modalHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.modalTitle, { color: colors.text, marginBottom: 2 }]}>{m?.name}'s Vault</Text>
                      <Text style={[s.subtitle, { color: colors.subtext }]}>
                        {mDocs.length} isolated documents stored for {m?.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={s.addDocHeaderBtn}
                      onPress={() => {
                        resetDocForm();
                        setAddDocMemberId(viewingId);
                      }}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={s.addDocHeaderBtnText}>Add Document</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={s.detailsList} showsVerticalScrollIndicator={false}>
                    {mDocs.length === 0 ? (
                      <View style={s.emptyDocs}>
                        <Feather name="folder" size={36} color={colors.mutedText} style={{ marginBottom: 8 }} />
                        <Text style={[s.emptyDocsText, { color: colors.subtext }]}>No documents added yet for {m?.name}.</Text>
                        <TouchableOpacity
                          style={[s.addBtn, { marginTop: 12 }]}
                          onPress={() => {
                            resetDocForm();
                            setAddDocMemberId(viewingId);
                          }}
                        >
                          <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={s.addBtnText}>Add First Document</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      mDocs.map((d) => (
                        <View key={d.id} style={[s.docItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View style={s.docIcon}>
                            <Feather name="file-text" size={16} color="#3B82F6" />
                          </View>
                          <View style={s.docInfo}>
                            <Text style={[s.docName, { color: colors.text }]} numberOfLines={1}>{d.name}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 3 }}>
                              <Text style={[s.docCategory, { color: colors.subtext }]}>{d.category}</Text>
                              <View
                                style={[
                                  s.statusPill,
                                  d.status === 'expired' ? s.statusExpired : d.status === 'soon' ? s.statusSoon : s.statusSafe
                                ]}
                              >
                                <Text
                                  style={[
                                    s.statusPillText,
                                    d.status === 'expired' ? s.statusExpiredText : d.status === 'soon' ? s.statusSoonText : s.statusSafeText
                                  ]}
                                >
                                  {d.status === 'expired' ? 'Expired' : d.status === 'soon' ? 'Expiring Soon' : 'Safe'}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={s.docActionsRow}>
                            <TouchableOpacity
                              style={s.docActionBtn}
                              onPress={() => openDocumentFile(d.file_url || '')}
                              title="Open File"
                            >
                              <Feather name="eye" size={14} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={s.docActionBtn}
                              onPress={() => downloadFileToDevice(d.file_url || '', d.name)}
                              title="Download"
                            >
                              <Feather name="download" size={14} color="#10B981" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={s.docActionBtn}
                              onPress={() => handleDeleteDocument(d.id, d.name)}
                              title="Delete"
                            >
                              <Feather name="trash-2" size={14} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                  <TouchableOpacity style={s.closeBtn} onPress={() => setViewingId(null)}>
                    <Text style={s.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Dedicated Add Document Modal for Member */}
      <Modal visible={!!addDocMemberId} animationType="slide" transparent={true} onRequestClose={() => setAddDocMemberId(null)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.modalBg, borderColor: colors.border, maxWidth: 480 }]}>
            {(() => {
              const memberObj = members.find((x) => x.id === addDocMemberId);
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[s.modalTitle, { color: colors.text }]}>Add Document for {memberObj?.name}</Text>

                  {/* Pick / Scan Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <TouchableOpacity style={s.pickerBtn} onPress={handlePickDocument}>
                      <Feather name="upload" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                      <Text style={s.pickerBtnText}>{docFile ? 'Change File' : 'Pick File'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.pickerBtn, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }]} onPress={handleScanDocument}>
                      <Feather name="camera" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
                      <Text style={[s.pickerBtnText, { color: '#7C3AED' }]}>{scanningDoc ? 'Scanning OCR...' : 'Scan Camera'}</Text>
                    </TouchableOpacity>
                  </View>

                  {docFile && (
                    <View style={s.fileSelectedBox}>
                      <Feather name="check-circle" size={14} color="#10B981" style={{ marginRight: 6 }} />
                      <Text style={s.fileSelectedText} numberOfLines={1}>Selected: {docFile.name || 'Document File'}</Text>
                    </View>
                  )}

                  {/* Document Title */}
                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.subtext }]}>Document Title *</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                      value={docName}
                      onChangeText={setDocName}
                      placeholder="e.g. Aadhaar Card, Passport, Health Insurance"
                      placeholderTextColor={colors.mutedText}
                    />
                  </View>

                  {/* Category Selection */}
                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.subtext }]}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            s.categoryChip,
                            docCategory === cat ? s.categoryChipActive : { backgroundColor: colors.inputBg, borderColor: colors.border }
                          ]}
                          onPress={() => setDocCategory(cat)}
                        >
                          <Text style={[s.categoryChipText, docCategory === cat && s.categoryChipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Expiry Date */}
                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.subtext }]}>Expiry Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                      value={docExpiry}
                      onChangeText={setDocExpiry}
                      placeholder="2030-12-31"
                      placeholderTextColor={colors.mutedText}
                    />
                  </View>

                  {/* Document Number */}
                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.subtext }]}>Document Number (Optional)</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                      value={docNumber}
                      onChangeText={setDocNumber}
                      placeholder="e.g. XXXX-XXXX-XXXX"
                      placeholderTextColor={colors.mutedText}
                    />
                  </View>

                  {/* Progress bar if uploading */}
                  {uploadingDoc && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, color: colors.subtext, marginBottom: 4 }}>Uploading to secure vault...</Text>
                      <ProgressBar progress={uploadProgress || 0.5} color="#3B82F6" />
                    </View>
                  )}

                  <TouchableOpacity
                    style={[s.saveButton, (uploadingDoc || !docFile || !docName.trim()) && s.disabledButton]}
                    onPress={() => handleSaveDocForMember(addDocMemberId!)}
                    disabled={uploadingDoc || !docFile || !docName.trim()}
                  >
                    {uploadingDoc ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={s.saveButtonText}>Save Document to {memberObj?.name}'s Vault</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.cancelButton}
                    onPress={() => {
                      setAddDocMemberId(null);
                      resetDocForm();
                    }}
                  >
                    <Text style={[s.cancelButtonText, { color: colors.subtext }]}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>

    </AppLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: Platform.OS === 'web' ? '31.5%' : '100%',
    minWidth: 260,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  pill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ownerPill: {
    backgroundColor: '#F3E8FF',
  },
  ownerPillText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
  },
  familyPill: {
    backgroundColor: '#EFF6FF',
    position: 'relative',
  },
  familyPillText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  docsCount: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 12.5,
    color: '#3B82F6',
    fontWeight: '600',
  },
  addDocSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addDocSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
    marginLeft: 3,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addDocHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addDocHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginRight: 20,
  },
  termsText: {
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 6,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },

  // Picker & Category styling
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 10,
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  fileSelectedText: {
    fontSize: 12.5,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  categoryChip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Detail viewer list
  detailsList: {
    maxHeight: 320,
    marginBottom: 12,
  },
  emptyDocs: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyDocsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  docIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  docCategory: {
    fontSize: 11,
    color: '#64748B',
  },
  statusPill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusSafe: {
    backgroundColor: '#DCFCE7',
  },
  statusSafeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
  },
  statusSoon: {
    backgroundColor: '#FEF3C7',
  },
  statusSoonText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '600',
  },
  statusExpired: {
    backgroundColor: '#FEE2E2',
  },
  statusExpiredText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '600',
  },
  docActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  docActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13.5,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default Family;
