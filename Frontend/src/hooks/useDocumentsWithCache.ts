import { useState, useEffect } from "react";
import { useDocuments } from "./useDocuments";
import type { DocumentRow } from "../services/supabase";
import { useAuth } from "./useAuth";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useDocumentsWithCache = () => {
  const { user } = useAuth();
  const docsHook = useDocuments();
  const [cachedDocs, setCachedDocs] = useState<DocumentRow[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCache = async () => {
      if (user) {
        const saved = await AsyncStorage.getItem(`smartdocs_cache_${user.id}`);
        if (saved) {
          try {
            setCachedDocs(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse cached documents", e);
          }
        } else {
          setCachedDocs([]);
        }
      } else {
        setCachedDocs([]);
      }
    };
    loadCache();
  }, [user?.id]);

  useEffect(() => {
    const saveCache = async () => {
      if (user && docsHook.documents.length > 0 && !docsHook.loading) {
        await AsyncStorage.setItem(`smartdocs_cache_${user.id}`, JSON.stringify(docsHook.documents));
        setCachedDocs(docsHook.documents);
      } else if (user && docsHook.documents.length === 0 && !docsHook.loading) {
        await AsyncStorage.removeItem(`smartdocs_cache_${user.id}`);
        setCachedDocs([]);
      }
    };
    saveCache();
  }, [docsHook.documents, docsHook.loading]);

  const activeDocuments = isOffline || (docsHook.loading && docsHook.documents.length === 0)
    ? cachedDocs
    : docsHook.documents;

  return {
    ...docsHook,
    documents: activeDocuments,
    isOffline,
    uploadProgress: docsHook.uploadProgress,
    deleteDocuments: docsHook.deleteDocuments,
  };
};
