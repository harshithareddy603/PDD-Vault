import { useCallback, useEffect, useState } from "react";
import { supabase, type DocumentRow, type DocStatus } from "../services/supabase";
import { useAuth } from "./useAuth";
import { saveFileLocal, getFileLocal, deleteFileLocal } from "../lib/db";
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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

  const uploadFile = async (file: any): Promise<string | null> => {
    if (!user) return null;
    const fileName = file.name || `file-${Date.now()}`;
    const path = `${user.id}/${Date.now()}-${fileName}`;
    
      setUploadProgress(0.1);
      
      try {
        let fileToUpload;
        if (isWeb) {
          // On web, we can fetch the blob from the uri (which is a blob url or local path)
          const response = await fetch(file.uri);
          fileToUpload = await response.blob();
        } else {
          // On mobile, we use a similar approach or the uri directly
          const response = await fetch(file.uri);
          fileToUpload = await response.blob();
        }
  
        console.log("Starting storage upload to path:", path);
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
      setError(err.message);
      setUploadProgress(0);
      return null;
    }
  };

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
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      console.warn("Could not find file in storage:", path);
      return null;
    }

    if (!isWeb) {
      try {
        const downloadRes = await FileSystem.downloadAsync(
          data.signedUrl,
          FileSystem.documentDirectory + 'temp-' + path.replace(/\//g, '-')
        );
        if (downloadRes.status === 200) {
          await saveFileLocal(path, downloadRes.uri);
          console.log("Downloaded and cached for future use:", path);
          return downloadRes.uri;
        }
      } catch (e) {
        console.error("Download failed, falling back to signed URL", e);
      }
    }

    // Fallback: Return the signed URL directly if caching failed
    return data.signedUrl;
  }, []);

  const addDocument = useCallback(async (input: {
    name: string;
    category: string;
    expiry_date?: string | null;
    family_member_id?: string | null;
    priority?: boolean;
    file?: any | null;
    source?: string | null;
  }) => {
    if (!user) return { error: new Error("Not signed in") };
    let file_url: string | null = null;
    let detectedSource = input.source;

    if (input.file) {
      // Basic detection
      const fname = (input.file.name || "").toLowerCase();
      if (fname.includes("aadhaar")) detectedSource = "aadhaar";
      else if (fname.includes("pan")) detectedSource = "pan";
      else if (fname.includes("passport")) detectedSource = "passport";
      else if (fname.includes("license") || fname.includes("dl")) detectedSource = "license";
      else if (fname.includes("voter")) detectedSource = "voter_id";

      file_url = await uploadFile(input.file);
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
    uploadProgress,
  };
};
