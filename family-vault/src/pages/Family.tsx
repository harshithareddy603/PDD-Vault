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
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

const Family = () => {
  const { user } = useAuth();
  const { members, loading, addMember, updateMember, deleteMember } = useFamily();
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';

  const reset = () => {
    setName('');
    setEditingId(null);
    setTermsAccepted(false);
  };

  const submit = async () => {
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
      reset();
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setTermsAccepted(true);
    setOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
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
            <Text style={s.pageTitle}>Family Management</Text>
            <Text style={s.subtitle}>{members.length + 1} family members</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
            <Feather name="plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={s.addBtnText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
        ) : (
          <View style={s.grid}>
            {/* 1. Owner Card */}
            <View style={s.card}>
              {/* Role Pill */}
              <View style={[s.pill, s.ownerPill]}>
                <Text style={s.ownerPillText}>owner</Text>
              </View>

              <View style={s.cardContent}>
                {/* Avatar */}
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{ownerInitials}</Text>
                </View>

                {/* Details */}
                <Text style={s.memberName} numberOfLines={1}>
                  {ownerName}
                </Text>
                <Text style={s.memberEmail} numberOfLines={1}>
                  {ownerEmail}
                </Text>

                {/* Docs Count */}
                <View style={s.bottomRow}>
                  <Text style={s.docsCount}>{ownerDocsCount} documents</Text>
                  <TouchableOpacity onPress={() => navigation?.navigate('Profile' as any)}>
                    <Text style={s.linkText}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 2. Family Members Cards */}
            {members.map((m) => {
              const initials = m.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const email = `${m.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
              const mDocs = documents.filter((d) => d.family_member_id === m.id);

              return (
                <View key={m.id} style={s.card}>
                  {/* Role Pill & Action Menu */}
                  <View style={s.cardTopBar}>
                    <View style={[s.pill, s.familyPill]}>
                      <Text style={s.familyPillText}>family</Text>
                    </View>
                    <View style={s.actions}>
                      <TouchableOpacity
                        onPress={() => startEdit(m.id, m.name)}
                        style={s.miniBtn}
                      >
                        <Feather name="edit-2" size={12} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(m.id, m.name)}
                        style={s.miniBtn}
                      >
                        <Feather name="trash-2" size={12} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={s.cardContent}>
                    {/* Avatar */}
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>{initials}</Text>
                    </View>

                    {/* Details */}
                    <Text style={s.memberName} numberOfLines={1}>
                      {m.name}
                    </Text>
                    <Text style={s.memberEmail} numberOfLines={1}>
                      {email}
                    </Text>

                    {/* Docs Count */}
                    <View style={s.bottomRow}>
                      <Text style={s.docsCount}>{mDocs.length} documents</Text>
                      <TouchableOpacity onPress={() => setViewingId(m.id)}>
                        <Text style={s.linkText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal visible={open} animationType="slide" transparent={true} onRequestClose={() => setOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editingId ? 'Edit Family Member' : 'Add Family Member'}</Text>
            <View style={s.inputGroup}>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={s.termsContainer}>
              <Checkbox.Android
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setTermsAccepted(!termsAccepted)}
                color="#3B82F6"
              />
              <Text style={s.termsText}>
                Please try to save correct details for accessing the files easily.
              </Text>
            </View>
            <TouchableOpacity
              style={[s.saveButton, !termsAccepted && s.disabledButton]}
              onPress={submit}
              disabled={!termsAccepted}
            >
              <Text style={s.saveButtonText}>{editingId ? 'Save Changes' : 'Add Member'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelButton} onPress={() => { setOpen(false); reset(); }}>
              <Text style={s.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Viewer Modal */}
      <Modal visible={!!viewingId} animationType="slide" transparent={true} onRequestClose={() => setViewingId(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {(() => {
              const m = members.find((x) => x.id === viewingId);
              const mDocs = documents.filter((d) => d.family_member_id === viewingId);
              return (
                <View>
                  <Text style={s.modalTitle}>{m?.name}'s Documents</Text>
                  <ScrollView style={s.detailsList} showsVerticalScrollIndicator={false}>
                    {mDocs.length === 0 ? (
                      <View style={s.emptyDocs}>
                        <Text style={s.emptyDocsText}>No documents added yet.</Text>
                      </View>
                    ) : (
                      mDocs.map((d) => (
                        <View key={d.id} style={s.docItem}>
                          <View style={s.docIcon}>
                            <Feather name="file-text" size={15} color="#3B82F6" />
                          </View>
                          <View style={s.docInfo}>
                            <Text style={s.docName} numberOfLines={1}>{d.name}</Text>
                            <Text style={s.docCategory}>{d.category}</Text>
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
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

  // Detail viewer list
  detailsList: {
    maxHeight: 280,
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
    marginBottom: 8,
  },
  docIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    marginTop: 2,
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
