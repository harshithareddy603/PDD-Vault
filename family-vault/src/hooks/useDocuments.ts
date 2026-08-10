import { useCallback, useEffect, useState } from "react";
import { supabase, type DocumentRow, type DocStatus } from "../services/supabase";
import { useAuth } from "./useAuth";
import { saveFileLocal, getFileLocal, deleteFileLocal } from "../lib/db";
import * as FileSystem from 'expo-file-system';
import { Platform, Alert, Linking } from 'react-native';

const isWeb = Platform.OS === 'web';

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
    else setDocuments((data ?? []) as DocumentRow[]);
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

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;
  const len = base64.length;
  if (base64[base64.length - 1] === "=") bufferLength--;
  if (base64[base64.length - 2] === "=") bufferLength--;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = base64Lookup[base64.charCodeAt(i)];
    const encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    const encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    const encoded4 = base64Lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
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

      // 3. On Android: Try ContentProvider URI directly so Android PDF Readers / Viewers can open it
      if (cachedUri && Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(cachedUri);
          console.log("Opening content URI on Android:", contentUri);
          await Linking.openURL(contentUri);
          return true;
        } catch (e) {
          console.warn("Could not open content URI directly:", e);
        }
      }

      // 4. On iOS: Try opening cached file URI directly
      if (cachedUri && Platform.OS === 'ios') {
        try {
          await Linking.openURL(cachedUri);
          return true;
        } catch (e) {
          console.warn("Could not open iOS file URI directly:", e);
        }
      }

      // 5. Fallback to opening remote HTTPS URL in native browser / viewer
      if (remoteUrl) {
        console.log("Opening remote URL fallback:", remoteUrl);
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
    uploadProgress,
    checkDuplicateDocument,
  };
};
