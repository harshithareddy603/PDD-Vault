import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from "react";
import { Checkbox } from 'react-native-paper';
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
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Document</Text>
          
          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document name</Text>
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
                  <TextInput 
                    style={styles.input} 
                    value={category} 
                    onChangeText={setCategory}
                    placeholder="Category"
                  />
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Expiry</Text>
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
                style={styles.input} 
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
              <Text style={styles.checkboxLabel}>Mark as priority</Text>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
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
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
  },
});
