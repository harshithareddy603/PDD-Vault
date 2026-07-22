import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert, Dimensions, FlatList, Platform } from 'react-native'
import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "../components/AppLayout";
import { useFamily } from "../hooks/useFamily";
import { useDocumentsWithCache } from "../hooks/useDocumentsWithCache";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DocumentLogo } from "../components/DocumentLogo";
import { DocumentPreviewSheet } from "../components/DocumentPreviewSheet";
import { QRShareDialog } from "../components/QRShareDialog";
import { EditDocumentDrawer } from "../components/EditDocumentDrawer";
import { BulkActionBar } from "../components/BulkActionBar";
import { Checkbox, ProgressBar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import type { DocumentRow } from "../services/supabase";
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ["ID", "Certificate", "Insurance", "Medical", "License", "Resume", "Passport", "Education", "Property", "Other"];
const FILTER_CHIPS = ["All", ...CATEGORIES, "⚠ Expiring Soon", "❌ Expired"];

const Documents = () => {
  const { members } = useFamily();
  const { documents, loading, addDocument, deleteDocument, deleteDocuments, getSignedUrl, isOffline, uploadProgress } = useDocumentsWithCache();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("ID");
  const [expiry, setExpiry] = useState("");
  const [owner, setOwner] = useState<string>("self");
  const [file, setFile] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [shareDoc, setShareDoc] = useState<DocumentRow | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentRow | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest_first");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "myself" | "family">("all");
  const [familyMemberFilter, setFamilyMemberFilter] = useState<string>("all");

  const scanDocument = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera permission is required to scan documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const timestamp = new Date().getTime();
        const scannedName = `Scan_${timestamp}`;
        setFile({
          uri: asset.uri,
          name: `${scannedName}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0
        });
        setName(scannedName);
        setOpen(true);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to start camera.");
    }
  };

  useEffect(() => {
    if (route.params?.triggerScan) {
      navigation.setParams({ triggerScan: undefined });
      scanDocument();
    }
  }, [route.params?.triggerScan]);

  useEffect(() => {
    if (route.params?.category) {
      setActiveFilter(route.params.category);
    } else {
      setActiveFilter("All");
    }
  }, [route.params?.category]);

  const reset = () => {
    setName(""); setCategory("ID"); setExpiry(""); setOwner("self"); setFile(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0
        });
        setName(asset.name.split('.')[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const submit = async () => {
    setBusy(true);
    const { error } = await addDocument({
      name,
      category,
      expiry_date: expiry || null,
      family_member_id: owner === "self" ? null : owner,
      file: file as any,
    });
    setBusy(false);
    if (error) Alert.alert("Error", error.message);
    else { 
      Alert.alert("Success", "Document saved"); 
      setOpen(false); 
      reset(); 
    }
  };

  const download = async (path: string) => {
    const url = await getSignedUrl(path);
    if (url) Linking.openURL(url);
    else Alert.alert("Error", "Could not get file");
  };

  const processedDocuments = useMemo(() => {
    return documents
      .filter((d) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const ownerName = d.family_member_id ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family" : "You";
          const matchesSearch = d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || ownerName.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        if (activeFilter !== "All") {
          if (activeFilter === "⚠ Expiring Soon") return d.status === "soon";
          if (activeFilter === "❌ Expired") return d.status === "expired";
          return d.category === activeFilter;
        }
        if (ownerFilter === "myself" && d.family_member_id !== null) return false;
        if (ownerFilter === "family") {
          if (d.family_member_id === null) return false;
          if (familyMemberFilter !== "all" && d.family_member_id !== familyMemberFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest_first") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "oldest_first") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "name_az") return a.name.localeCompare(b.name);
        if (sortBy === "name_za") return b.name.localeCompare(a.name);
        if (sortBy === "expiry_soonest") {
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        }
        return 0;
      });
  }, [documents, searchQuery, activeFilter, ownerFilter, familyMemberFilter, sortBy, members]);

  return (
    <AppLayout>
      <View style={styles.container}>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Viewing cached offline data.</Text>
          </View>
        )}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>Manage your secure vault</Text>
          </View>
          <TouchableOpacity 
            style={[styles.selectButton, selectionMode && styles.activeSelectButton]}
            onPress={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
          >
            <Feather name={selectionMode ? "x" : "check-square"} size={16} color={selectionMode ? "#fff" : "#64748B"} />
            <Text style={[styles.selectButtonText, selectionMode && styles.activeSelectButtonText]}>
              {selectionMode ? "Cancel" : "Select"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>



        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : processedDocuments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {processedDocuments.map((d) => {
              const isSelected = selectedIds.has(d.id);
              const ownerName = d.family_member_id
                ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family"
                : "You";

              return (
                <View key={d.id} style={[styles.card, isSelected && styles.selectedCard]}>
                  {selectionMode && (
                    <View style={styles.checkboxContainer}>
                      <Checkbox.Android
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => {
                          const newSet = new Set(selectedIds);
                          if (isSelected) newSet.delete(d.id); else newSet.add(d.id);
                          setSelectedIds(newSet);
                        }}
                        color="#3b82f6"
                      />
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.cardMain}
                    onPress={() => {
                      if (selectionMode) {
                        const newSet = new Set(selectedIds);
                        if (isSelected) newSet.delete(d.id); else newSet.add(d.id);
                        setSelectedIds(newSet);
                      } else {
                        setPreviewDoc(d);
                      }
                    }}
                  >
                    <View style={styles.logoContainer}>
                      <DocumentLogo name={d.name} category={d.category} source={d.source} size={24} />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
                      <Text style={styles.docMeta}>{d.category} · {ownerName}</Text>
                      {d.expiry_date && (
                        <Text style={styles.docExpiry}>Expires {d.expiry_date}</Text>
                      )}
                    </View>
                    <StatusPill status={d.status} />
                  </TouchableOpacity>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => download(d.file_url!)}>
                      <Feather name="download" size={16} color="#64748B" />
                      <Text style={styles.actionText}>Open</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setShareDoc(d)}>
                      <Feather name="share-2" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setEditDoc(d)}>
                      <Feather name="edit-2" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.iconBtn} 
                      onPress={() => {
                        const title = "Delete Document";
                        const message = "Are you sure you want to delete this document? This action cannot be undone.";
                        
                        if (Platform.OS === 'web') {
                          if (window.confirm(`${title}\n\n${message}`)) {
                            (async () => {
                              const { error } = await deleteDocument(d.id);
                              if (error) Alert.alert("Error", "Failed to delete: " + error.message);
                              else Alert.alert("Success", "Document deleted.");
                            })();
                          }
                        } else {
                          Alert.alert(
                            title,
                            message,
                            [
                              { text: "Cancel", style: "cancel" },
                              { 
                                text: "Delete", 
                                style: "destructive", 
                                onPress: async () => {
                                  const { error } = await deleteDocument(d.id);
                                  if (error) Alert.alert("Error", "Failed to delete: " + error.message);
                                  else Alert.alert("Success", "Document deleted.");
                                } 
                              }
                            ]
                          );
                        }
                      }}
                    >
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {!selectionMode && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setOpen(true)}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Add Document Modal */}
      <Modal visible={open} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Document</Text>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Document name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Category</Text>
                  {Platform.OS === 'web' ? (
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        borderRadius: 12,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        fontSize: 16,
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        width: '100%',
                        height: 50,
                        cursor: 'pointer',
                        color: '#0F172A',
                      }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="ID, License..." />
                  )}
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Expiry</Text>
                  <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="YYYY-MM-DD" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>File</Text>
                <TouchableOpacity 
                  style={[styles.filePicker, busy && styles.disabledInput]} 
                  onPress={pickDocument}
                  disabled={busy}
                >
                  <Feather name="file" size={18} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.filePickerText}>
                    {file ? file.name : "Choose File"}
                  </Text>
                </TouchableOpacity>
              </View>

              {busy && (
                <View style={styles.uploadProgressContainer}>
                  <Text style={styles.uploadLabel}>Uploading document... {Math.round(uploadProgress * 100)}%</Text>
                  <ProgressBar progress={uploadProgress} color="#3b82f6" style={styles.uploadBar} />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.saveButton, busy && styles.disabledButton]} 
                onPress={submit}
                disabled={busy}
              >
                {busy ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Uploading...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save document</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.cancelButton, busy && { opacity: 0.5 }]} 
                onPress={() => { setOpen(false); reset(); }}
                disabled={busy}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DocumentPreviewSheet document={previewDoc} isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} />
      <QRShareDialog document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
      <EditDocumentDrawer document={editDoc} isOpen={!!editDoc} onClose={() => setEditDoc(null)} />
      
      {selectionMode && selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={processedDocuments.length}
          onSelectAll={() => setSelectedIds(new Set(processedDocuments.map(d => d.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onDownload={() => Alert.alert("Download", "Bulk download is available on web.")}
          onDelete={() => {
            Alert.alert(
              "Delete Multiple",
              `Are you sure you want to delete ${selectedIds.size} documents? This action cannot be undone.`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Delete", 
                  style: "destructive", 
                  onPress: async () => {
                    setIsDeletingBulk(true);
                    const { error } = await deleteDocuments(Array.from(selectedIds));
                    setIsDeletingBulk(false);
                    if (error) {
                      Alert.alert("Error", "Failed to delete documents: " + error.message);
                    } else {
                      Alert.alert("Success", `${selectedIds.size} documents deleted.`);
                      setSelectedIds(new Set());
                      setSelectionMode(false);
                    }
                  } 
                }
              ]
            );
          }}
          isDownloading={isDownloadingZip}
          isDeleting={isDeletingBulk}
        />
      )}
    </AppLayout>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const stylesMap: any = {
    expired: { bg: '#FEE2E2', color: '#EF4444', icon: 'alert-triangle' },
    soon: { bg: '#FEF3C7', color: '#F59E0B', icon: 'clock' },
    safe: { bg: '#DCFCE7', color: '#10B981', icon: 'check-circle' },
  };
  const config = stylesMap[status] || stylesMap.safe;
  return (
    <View style={[pillStyles.pill, { backgroundColor: config.bg }]}>
      <Feather name={config.icon} size={10} color={config.color} />
      <Text style={[pillStyles.pillText, { color: config.color }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pillText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    padding: 0,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offlineText: {
    color: '#92400E',
    fontSize: 12,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  activeSelectButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  selectButtonText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeSelectButtonText: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'column',
    width: Platform.OS === 'web' ? '48.5%' : '100%',
    minWidth: 280,
  },
  selectedCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#EFF6FF',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    left: 8,
    zIndex: 10,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  docExpiry: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  modalForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  filePickerText: {
    color: '#64748B',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.8,
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  uploadProgressContainer: {
    marginVertical: 16,
  },
  uploadLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  uploadBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default Documents;
