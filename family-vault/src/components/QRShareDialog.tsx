import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState, useRef } from "react";
import { useDocuments } from "../hooks/useDocuments";
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { DocumentRow } from "../services/supabase";

interface QRShareDialogProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRShareDialog = ({ document, isOpen, onClose }: QRShareDialogProps) => {
  const { getSignedUrl } = useDocuments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      const fetchUrl = async () => {
        setLoading(true);
        setSignedUrl(null);
        try {
          // Ideally 86400s (24 hours)
          const url = await getSignedUrl(document.file_url!, 86400); 
          if (url) {
            setSignedUrl(url);
          } else {
            Alert.alert("Error", "Failed to generate share link");
          }
        } catch (error) {
          Alert.alert("Error", "Error generating share link");
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    }
  }, [isOpen, document, getSignedUrl]);

  const handleCopy = async () => {
    if (signedUrl) {
      await Clipboard.setStringAsync(signedUrl);
      Alert.alert("Success", "Link copied!");
    }
  };

  const handleDownload = () => {
    // In React Native, saving a QR as image requires extra libraries like react-native-view-shot
    Alert.alert("Info", "QR code download is available in the desktop version. Use link sharing on mobile.");
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Share Document</Text>
          
          <View style={styles.main}>
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Generating secure link...</Text>
              </View>
            ) : signedUrl ? (
              <>
                <View style={styles.qrContainer}>
                  <QRCode 
                    value={signedUrl} 
                    size={200} 
                    getRef={(c) => (qrRef.current = c)}
                  />
                </View>
                
                <View style={styles.linkContainer}>
                  <TextInput 
                    value={signedUrl} 
                    editable={false} 
                    style={styles.linkInput}
                  />
                  <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                    <Feather name="copy" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.downloadButton} 
                  onPress={handleDownload}
                >
                  <Feather name="download" size={18} color="#fff" style={styles.icon} />
                  <Text style={styles.downloadButtonText}>Download QR</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.errorText}>Unable to generate share link.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  main: {
    width: '100%',
    alignItems: 'center',
  },
  centerContent: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  linkInput: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    paddingVertical: 12,
  },
  copyButton: {
    padding: 8,
  },
  downloadButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 40,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: '#64748B',
    fontSize: 14,
  },
});
