import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from "react";
import { Checkbox } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useFamily } from "../hooks/useFamily";
import { useDocuments } from "../hooks/useDocuments";
import type { DocumentRow } from "../services/supabase";

const CATEGORIES = ["ID", "Certificate", "Insurance", "Medical", "License", "Resume", "Passport", "Education", "Property", "Other"];

interface EditDocumentDrawerProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDocumentDrawer = ({ document, isOpen, onClose }: EditDocumentDrawerProps) => {
  const { members } = useFamily();
  const { updateDocument } = useDocuments();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("ID");
  const [expiry, setExpiry] = useState("");
  const [owner, setOwner] = useState<string>("self");
  const [priority, setPriority] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (document && isOpen) {
      setName(document.name);
      setCategory(document.category);
      setExpiry(document.expiry_date || "");
      setOwner(document.family_member_id || "self");
      setPriority(document.priority);
    }
  }, [document, isOpen]);

  const submit = async () => {
    if (!document) return;
    setBusy(true);
    const { error } = await updateDocument(document.id, {
      name,
      category,
      expiry_date: expiry || null,
      family_member_id: owner === "self" ? null : owner,
      priority,
    });
    setBusy(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Document updated successfully");
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        {/* Top Full-Page Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Document</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Document Name</Text>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="Enter name"
            />
          </View>

          <View style={styles.row}>
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
                    backgroundColor: '#FFFFFF',
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
                <TextInput 
                  style={styles.input} 
                  value={category} 
                  onChangeText={setCategory}
                  placeholder="Category"
                />
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput 
                style={styles.input} 
                value={expiry} 
                onChangeText={setExpiry}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Belongs to</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: '#E2E8F0' }]} 
              value={owner === "self" ? "Myself" : (members.find(m => m.id === owner)?.name || "Myself")} 
              editable={false}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={priority ? 'checked' : 'unchecked'}
              onPress={() => setPriority(!priority)}
              color="#3b82f6"
            />
            <Text style={styles.checkboxLabel}>Mark as priority document</Text>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, busy && styles.disabledButton]} 
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default EditDocumentDrawer;
