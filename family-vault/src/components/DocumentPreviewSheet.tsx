import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform, Animated } from 'react-native';
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
  
  // Google Docs Embedded Viewer URL for PDF (100% in-app with pinch-to-zoom)
  const googleDocsViewerUrl = targetFileUrl 
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetFileUrl)}`
    : null;

  // HTML content for Image pinch-to-zoom inside WebView
  const imageHtmlContent = targetFileUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #0F172A;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            user-select: none;
            -webkit-user-select: none;
          }
        </style>
      </head>
      <body>
        <img src="${targetFileUrl}" alt="Document Preview" />
      </body>
    </html>
  ` : '';

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
        {/* Fullscreen Header Bar */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
            <Text style={styles.subtitle}>{document.category} · In-App Preview & Pinch-Zoom</Text>
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

        {/* Fullscreen In-App Content Area */}
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading document inside app...</Text>
            </View>
          ) : targetFileUrl ? (
            <View style={styles.previewContainer}>
              {isPdf ? (
                Platform.OS === 'web' ? (
                  <iframe
                    src={googleDocsViewerUrl || targetFileUrl}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                    title="PDF In-App Viewer"
                  />
                ) : (
                  <WebView
                    source={{ uri: googleDocsViewerUrl || targetFileUrl }}
                    style={{ flex: 1, width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#0F172A' }}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                    setBuiltInZoomControls={true}
                    setDisplayZoomControls={false}
                    allowsInlineMediaPlayback={true}
                    renderLoading={() => (
                      <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Opening PDF in-app with pinch-to-zoom...</Text>
                      </View>
                    )}
                  />
                )
              ) : isImage ? (
                Platform.OS === 'web' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
                    <img src={targetFileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <WebView
                    originWhitelist={['*']}
                    source={{ html: imageHtmlContent }}
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#0F172A' }}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                    setBuiltInZoomControls={true}
                    setDisplayZoomControls={false}
                  />
                )
              ) : (
                <View style={styles.centerContent}>
                  <View style={styles.fallbackIconContainer}>
                    <Text style={styles.fallbackExt}>{ext?.toUpperCase() || "?"}</Text>
                  </View>
                  <Text style={styles.notAvailableTitle}>File Ready</Text>
                  <Text style={styles.notAvailableSubtitle}>
                    Tap below to download this file onto your device.
                  </Text>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => downloadFileToDevice(document.file_url!, document.name)}
                  >
                    <Feather name="download" size={18} color="#fff" style={styles.btnIcon} />
                    <Text style={styles.primaryButtonText}>Download File</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 8,
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
