import { useCallback, useEffect, useState } from "react";
import { supabase, type DocumentRow, type DocStatus } from "../services/supabase";
import { useAuth } from "./useAuth";
import { saveFileLocal, getFileLocal, deleteFileLocal } from "../lib/db";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';

const isWeb = Platform.OS === 'web';

import { NotificationService } from "../services/notificationService";

const computeStatus = (expiry: string | null): DocStatus => {
  if (!expiry) return "safe";
  const now = new Date();
  const exp = new Date(expiry);
  const days = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  return "safe";
};

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      const docs = (data ?? []) as DocumentRow[];
      setDocuments(docs);
      // Automatically sync mobile top status bar / system notifications
      NotificationService.syncDocumentNotifications(docs);
    }
    setLoading(false);
  }, [user]);


  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Background Pre-fetching logic
  useEffect(() => {
    const prefetch = async () => {
      if (!isWeb && documents.length > 0 && !loading) {
        // Pre-fetch the most recent 10 documents
        const recentDocs = documents.slice(0, 10);
        for (const doc of recentDocs) {
          if (doc.file_url) {
            const cached = await getFileLocal(doc.file_url);
            if (!cached) {
              const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_url, 600);
              if (data?.signedUrl && !error) {
                try {
                  const downloadRes = await FileSystem.downloadAsync(
                    data.signedUrl,
                    FileSystem.documentDirectory + 'temp-' + doc.file_url.replace(/\//g, '-')
                  );
                  if (downloadRes.status === 200) {
                    await saveFileLocal(doc.file_url, downloadRes.uri);
                    console.log("Pre-fetched and cached:", doc.name);
                  }
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          }
        }
      }
    };
    
    // Wait 3 seconds after load before starting background sync
    const timer = setTimeout(prefetch, 3000);
    return () => clearTimeout(timer);
  }, [documents, loading]);

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/[\r\n\s]/g, '');
  
  if (typeof atob === 'function') {
    try {
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (e) {
      console.warn("atob conversion failed, falling back to manual decode:", e);
    }
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Int16Array(256);
  lookup.fill(-1);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = Math.floor(cleanBase64.length * 0.75);
  if (cleanBase64.endsWith("==")) bufferLength -= 2;
  else if (cleanBase64.endsWith("=")) bufferLength -= 1;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  let p = 0;

  for (let i = 0; i < cleanBase64.length; i += 4) {
    const c1 = cleanBase64.charCodeAt(i);
    const c2 = cleanBase64.charCodeAt(i + 1);
    const c3 = cleanBase64.charCodeAt(i + 2);
    const c4 = cleanBase64.charCodeAt(i + 3);

    const e1 = lookup[c1];
    const e2 = lookup[c2];
    const e3 = c3 === 61 ? 0 : lookup[c3];
    const e4 = c4 === 61 ? 0 : lookup[c4];

    if (e1 < 0 || e2 < 0) continue;

    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (c3 !== 61 && p < bufferLength) {
      bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    }
    if (c4 !== 61 && p < bufferLength) {
      bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
    }
  }

  return arrayBuffer;
}

  const uploadFile = async (file: any): Promise<string | null> => {
    if (!user) return null;
    const fileName = file.name || `file-${Date.now()}`;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${Date.now()}-${cleanFileName}`;
    
    setUploadProgress(0.1);
    
    try {
      let fileToUpload: any;
      if (isWeb) {
        if (typeof Blob !== 'undefined' && file instanceof Blob) {
          fileToUpload = file;
        } else if (file.uri) {
          const response = await fetch(file.uri);
          fileToUpload = await response.blob();
        } else {
          fileToUpload = file;
        }
      } else {
        if (file.uri) {
          console.log("Reading file as base64 for mobile upload:", file.uri);
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          fileToUpload = base64ToArrayBuffer(base64);
        } else {
          throw new Error("File URI is missing");
        }
      }

      console.log("Starting storage upload to path:", path);
      setUploadProgress(0.5);

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(path, fileToUpload, { 
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });
      
      setUploadProgress(1.0);

      if (error) {
        console.error("Storage Upload Error:", error);
        setError(error.message);
        setUploadProgress(0);
        return null;
      }
      
      console.log("Storage upload successful:", data);
      setTimeout(() => setUploadProgress(0), 500);
      return path;
    } catch (err: any) {
      console.error("File processing error:", err);
      setError(err.message || "File upload failed");
      setUploadProgress(0);
      return null;
    }
  };

  const getRemoteSignedUrl = useCallback(async (path: string, expiresIn = 3600) => {
    if (!path) return null;
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      console.warn("Could not generate remote signed URL:", path, error);
      return null;
    }
    return data.signedUrl;
  }, []);

  const getSignedUrl = useCallback(async (path: string, expiresIn = 3600) => {
    if (!path) {
      console.warn("getSignedUrl called with null/empty path");
      return null;
    }
    // 1. Check local cache first
    let cachedUri = await getFileLocal(path);
    
    if (!isWeb && cachedUri) {
      console.log("Serving from local cache:", path);
      return cachedUri;
    }

    // 2. If not in cache, fetch from Supabase
    return getRemoteSignedUrl(path, expiresIn);
  }, [getRemoteSignedUrl]);

  const openDocumentFile = useCallback(async (path: string) => {
    if (!path) {
      Alert.alert("Error", "No file path provided for this document.");
      return false;
    }

    try {
      // 1. Fetch remote signed URL from Supabase
      const remoteUrl = await getRemoteSignedUrl(path, 3600);

      if (isWeb) {
        if (remoteUrl) {
          await Linking.openURL(remoteUrl);
          return true;
        }
        Alert.alert("Error", "Could not generate document view link.");
        return false;
      }

      // 2. On Mobile (Android / iOS):
      let cachedUri = await getFileLocal(path);

      // Download file locally if not cached
      if (!cachedUri && remoteUrl) {
        try {
          const downloadRes = await FileSystem.downloadAsync(
            remoteUrl,
            FileSystem.documentDirectory + 'temp-' + path.replace(/[\/\\?%*:|"<>]/g, '-')
          );
          if (downloadRes.status === 200) {
            await saveFileLocal(path, downloadRes.uri);
            cachedUri = downloadRes.uri;
          }
        } catch (e) {
          console.warn("Download for opening failed:", e);
        }
      }

      // 3. On Mobile (Android / iOS): Use Expo Sharing to open via native system viewer / app chooser
      if (cachedUri) {
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            const ext = path.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (['jpg', 'jpeg'].includes(ext || '')) mimeType = 'image/jpeg';
            else if (ext === 'png') mimeType = 'image/png';

            console.log("Opening document with native Sharing module:", cachedUri, mimeType);
            await Sharing.shareAsync(cachedUri, {
              mimeType,
              dialogTitle: 'Open Document',
              UTI: ext === 'pdf' ? 'com.adobe.pdf' : undefined,
            });
            return true;
          }
        } catch (e) {
          console.warn("Sharing.shareAsync failed, attempting fallback:", e);
        }
      }

      // 4. Fallback to opening remote HTTPS URL in native browser / viewer
      if (remoteUrl) {
        console.log("Opening remote URL fallback in browser:", remoteUrl);
        await Linking.openURL(remoteUrl);
        return true;
      }

      Alert.alert("Error", "Could not open file.");
      return false;
    } catch (err: any) {
      console.error("Error opening document file:", err);
      Alert.alert("Error", "Could not open document: " + (err.message || "Unknown error"));
      return false;
    }
  }, [getRemoteSignedUrl]);

  const downloadFileToDevice = useCallback(async (path: string, fileName?: string) => {
    if (!path) {
      Alert.alert("Error", "No file path specified for download.");
      return false;
    }

    try {
      const remoteUrl = await getRemoteSignedUrl(path, 3600);
      if (!remoteUrl) {
        Alert.alert("Error", "Could not generate download link.");
        return false;
      }

      const pathExt = path.split('.').pop()?.toLowerCase() || '';
      let nameToSave = fileName || path.split('/').pop() || `document-${Date.now()}`;
      if (pathExt && !nameToSave.toLowerCase().endsWith('.' + pathExt)) {
        nameToSave = `${nameToSave}.${pathExt}`;
      }

      if (isWeb) {
        const link = document.createElement('a');
        link.href = remoteUrl;
        link.download = nameToSave;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }

      // On Mobile (Android / iOS): 100% Automatic Download into Files by Google Downloads!
      const cleanName = nameToSave.replace(/[\/\\?%*:|"<>]/g, '_');
      const targetUri = FileSystem.documentDirectory + cleanName;

      console.log("Downloading file directly to device storage:", targetUri);
      const downloadRes = await FileSystem.downloadAsync(remoteUrl, targetUri);

      if (downloadRes.status === 200) {
        await saveFileLocal(path, downloadRes.uri);

        // Save automatically into Android public Media Store / Downloads folder WITHOUT any folder picker!
        if (Platform.OS === 'android') {
          try {
            const mediaPerm = await MediaLibrary.requestPermissionsAsync();
            if (mediaPerm.granted) {
              await MediaLibrary.createAssetAsync(downloadRes.uri);
            }
          } catch (mErr) {
            console.warn("MediaLibrary auto-save warning:", mErr);
          }
        }

        Alert.alert(
          "Download Complete",
          `✅ Saved automatically to Files by Google > Downloads:\n${cleanName}`,
          [{ text: "OK" }]
        );
        return true;
      } else {
        Alert.alert("Error", "Failed to download file.");
        return false;
      }
    } catch (err: any) {
      console.error("Error downloading file:", err);
      Alert.alert("Error", "Download failed: " + (err.message || "Unknown error"));
      return false;
    }
  }, [getRemoteSignedUrl]);

  const checkDuplicateDocument = useCallback((docNumber?: string | null, name?: string | null) => {
    if (!docNumber && !name) return null;
    
    const cleanNum = docNumber ? docNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '';
    const cleanName = name ? name.trim().toLowerCase() : '';

    const existing = documents.find((doc) => {
      if (cleanNum && doc.document_number) {
        const existingNum = doc.document_number.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (existingNum === cleanNum) return true;
      }
      if (cleanName && doc.name) {
        if (doc.name.trim().toLowerCase() === cleanName) return true;
      }
      return false;
    });

    return existing || null;
  }, [documents]);

  const addDocument = useCallback(async (input: {
    name: string;
    category: string;
    expiry_date?: string | null;
    family_member_id?: string | null;
    priority?: boolean;
    file?: any | null;
    source?: string | null;
    document_number?: string | null;
    file_hash?: string | null;
  }) => {
    if (!user) return { error: new Error("Not signed in") };
    let file_url: string | null = null;
    let detectedSource = input.source;

    if (!input.file) {
      return { error: new Error("File is required. Please select or scan a document before saving.") };
    }

    // Basic detection
    const fname = (input.file.name || "").toLowerCase();
    if (fname.includes("aadhaar")) detectedSource = "aadhaar";
    else if (fname.includes("pan")) detectedSource = "pan";
    else if (fname.includes("passport")) detectedSource = "passport";
    else if (fname.includes("license") || fname.includes("dl")) detectedSource = "license";
    else if (fname.includes("voter")) detectedSource = "voter_id";

    file_url = await uploadFile(input.file);
    if (!file_url) {
      return { error: new Error("Failed to upload document file to storage. Please check connection/permissions and try again.") };
    }

    const status = computeStatus(input.expiry_date ?? null);
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      family_member_id: input.family_member_id ?? null,
      name: input.name,
      category: input.category,
      expiry_date: input.expiry_date ?? null,
      priority: !!input.priority,
      status,
      file_url,
      source: detectedSource ?? null,
      document_number: input.document_number ?? null,
      file_hash: input.file_hash ?? null,
    });
    if (!error) {
      if (input.file && file_url) {
        await saveFileLocal(file_url, input.file.uri);
      }
      await fetchDocuments();
    }
    return { error };
  }, [user, fetchDocuments]);

  const updateDocument = useCallback(async (id: string, patch: Partial<DocumentRow>) => {
    if (patch.expiry_date !== undefined) {
      patch.status = computeStatus(patch.expiry_date);
    }
    const { error } = await supabase.from("documents").update(patch).eq("id", id);
    if (!error) await fetchDocuments();
    return { error };
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      console.log("Starting deletion for document:", id);
      const doc = documents.find((d) => d.id === id);
      if (doc?.file_url) {
        console.log("Deleting storage file:", doc.file_url);
        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage.from("documents").remove([doc.file_url]);
        if (storageError) {
          console.error("Storage deletion failed:", storageError);
        }
        
        // 2. Delete from local cache
        await deleteFileLocal(doc.file_url);
      }
      // 3. Delete from Database
      console.log("Deleting database record for:", id);
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) {
        console.error("Database deletion failed:", error);
        return { error };
      }
      
      console.log("Deletion successful, fetching documents...");
      await fetchDocuments();
      return { error: null };
    } catch (e: any) {
      console.error("Delete exception:", e);
      return { error: e };
    }
  }, [documents, fetchDocuments]);

  const deleteDocuments = useCallback(async (ids: string[]) => {
    try {
      const docsToDelete = documents.filter(d => ids.includes(d.id));
      const filePaths = docsToDelete.map(d => d.file_url).filter(Boolean) as string[];
      
      if (filePaths.length > 0) {
        await supabase.storage.from("documents").remove(filePaths);
        for (const path of filePaths) {
          await deleteFileLocal(path);
        }
      }
      
      const { error } = await supabase.from("documents").delete().in("id", ids);
      if (!error) await fetchDocuments();
      return { error };
    } catch (e: any) {
      console.error("Bulk delete failed:", e);
      return { error: e };
    }
  }, [documents, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    deleteDocuments,
    getSignedUrl,
    getRemoteSignedUrl,
    openDocumentFile,
    downloadFileToDevice,
    uploadProgress,
    checkDuplicateDocument,
  };
};
