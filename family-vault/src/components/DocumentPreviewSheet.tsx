import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Linking, Alert } from 'react-native'
import React, { useEffect, useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { DocumentRow } from "../services/supabase";

interface DocumentPreviewSheetProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewSheet = ({ document, isOpen, onClose }: DocumentPreviewSheetProps) => {
  const { getSignedUrl } = useDocuments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      const fetchUrl = async () => {
        setLoading(true);
        setSignedUrl(null);
        try {
          // getSignedUrl uses 3600 seconds by default or similar.
          const url = await getSignedUrl(document.file_url!);
          if (url) {
            setSignedUrl(url);
          } else {
            Alert.alert("Error", "Failed to load preview");
          }
        } catch (error) {
          Alert.alert("Error", "Error loading preview");
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    }
  }, [isOpen, document, getSignedUrl]);

  if (!document) return null;

  const ext = document.file_url?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  const isPdf = ext === "pdf";

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.title}>Document Preview</Text>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading preview...</Text>
            </View>
          ) : signedUrl ? (
            <View style={styles.previewContainer}>
              {isPdf ? (
                <View style={styles.centerContent}>
                  <MaterialCommunityIcons name="file-pdf-box" size={64} color="#EF4444" />
                  <Text style={styles.pdfText}>PDF Preview is not supported directly. Please open in browser.</Text>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => Linking.openURL(signedUrl)}
                  >
                    <Feather name="download" size={16} color="#fff" style={styles.icon} />
                    <Text style={styles.primaryButtonText}>Open PDF</Text>
                  </TouchableOpacity>
                </View>
              ) : isImage ? (
                <Image 
                  source={{ uri: signedUrl }} 
                  style={styles.image} 
                  resizeMode="contain" 
                />
              ) : (
                <View style={styles.centerContent}>
                  <View style={styles.fallbackIconContainer}>
                    <Text style={styles.fallbackExt}>{ext?.toUpperCase() || "?"}</Text>
                  </View>
                  <Text style={styles.notAvailableTitle}>Preview not available</Text>
                  <Text style={styles.notAvailableSubtitle}>
                    This file type cannot be previewed directly. You can download it to view it.
                  </Text>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => Linking.openURL(signedUrl)}
                  >
                    <Feather name="download" size={16} color="#fff" style={styles.icon} />
                    <Text style={styles.primaryButtonText}>Download File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>
                {document?.file_url ? "Failed to load preview URL." : "No file attached to this document."}
              </Text>
            </View>
          )}
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
    height: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 50,
    padding: 8,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  pdfText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
  fallbackIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackExt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
  },
  notAvailableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  notAvailableSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#64748B',
    textAlign: 'center',
  },
});
