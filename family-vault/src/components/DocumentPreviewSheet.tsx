import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform, Animated, Image, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import type { DocumentRow } from "../services/supabase";

interface DocumentPreviewSheetProps {
  document: DocumentRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewSheet = ({ document, isOpen, onClose }: DocumentPreviewSheetProps) => {
  const { getSignedUrl, getRemoteSignedUrl, downloadFileToDevice } = useDocuments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(16)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          tension: 35,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start();
    } else {
      slideAnim.setValue(16);
      fadeAnim.setValue(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      const fetchUrl = async () => {
        setLoading(true);
        setSignedUrl(null);
        setRemoteUrl(null);
        try {
          const url = await getSignedUrl(document.file_url!);
          const rUrl = await getRemoteSignedUrl(document.file_url!);
          if (url) setSignedUrl(url);
          if (rUrl) setRemoteUrl(rUrl);
        } catch (error) {
          console.error("Error loading preview URLs:", error);
          Alert.alert("Error", "Error loading document preview");
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    }
  }, [isOpen, document]);

  if (!document) return null;

  const ext = document.file_url?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  const isPdf = ext === "pdf";

  const targetFileUrl = remoteUrl || signedUrl;

  // Google GView Viewer URL for 100% reliable PDF rendering on Android WebView
  const googleGViewUrl = targetFileUrl
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetFileUrl)}`
    : null;

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Fullscreen Edge-to-Edge Header Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12, marginRight: 12 }}>
            <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
            <Text style={styles.subtitle}>{document.category} · Full-Screen View</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconHeaderButton} 
              onPress={() => downloadFileToDevice(document.file_url!, document.name)}
            >
              <Feather name="download" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fullscreen Edge-to-Edge Content Area */}
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Opening document...</Text>
            </View>
          ) : targetFileUrl ? (
            <View style={styles.previewContainer}>
              {isPdf ? (
                Platform.OS === 'web' ? (
                  <iframe
                    src={targetFileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Preview"
                  />
                ) : googleGViewUrl ? (
                  <WebView
                    source={{ uri: googleGViewUrl }}
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#0F172A' }}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                    setBuiltInZoomControls={true}
                    setDisplayZoomControls={false}
                    renderLoading={() => (
                      <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Rendering PDF document...</Text>
                      </View>
                    )}
                  />
                ) : (
                  <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Preparing document viewer...</Text>
                  </View>
                )
              ) : isImage ? (
                <ScrollView
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                  maximumZoomScale={5}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                >
                  <Image 
                    source={{ uri: targetFileUrl }} 
                    style={styles.fullImage} 
                    resizeMode="contain" 
                  />
                </ScrollView>
              ) : (
                <View style={styles.centerContent}>
                  <View style={styles.fallbackIconContainer}>
                    <Text style={styles.fallbackExt}>{ext?.toUpperCase() || "?"}</Text>
                  </View>
                  <Text style={styles.notAvailableTitle}>File Ready</Text>
                  <Text style={styles.notAvailableSubtitle}>
                    Tap below to download this file onto your device Downloads folder.
                  </Text>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => downloadFileToDevice(document.file_url!, document.name)}
                  >
                    <Feather name="download" size={18} color="#fff" style={styles.btnIcon} />
                    <Text style={styles.primaryButtonText}>Download to Downloads Folder</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>
                {document?.file_url ? "Failed to load document preview." : "No file attached to this document."}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 20,
  },
  iconHeaderButton: {
    padding: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
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
    color: '#94A3B8',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  btnIcon: {
    marginRight: 10,
  },
  fallbackIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#1E293B',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackExt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  notAvailableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notAvailableSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default DocumentPreviewSheet;
