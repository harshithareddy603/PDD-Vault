import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const getBaseDir = () => (isWeb ? '' : (FileSystem.documentDirectory || '') + 'files/');

const ensureDir = async () => {
  if (isWeb || !FileSystem.documentDirectory) return;
  const dir = getBaseDir();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

export const saveFileLocal = async (id: string, content: any) => {
  if (isWeb || !FileSystem.documentDirectory) return false;
  try {
    await ensureDir();
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = getBaseDir() + fileName;
    
    if (typeof content === 'string' && content.includes('://')) {
      await FileSystem.copyAsync({ from: content, to: fileUri });
    }
    return true;
  } catch (e) {
    console.error("Failed to save file locally", e);
    return false;
  }
};

export const getFileLocal = async (id: string): Promise<string | null> => {
  if (isWeb || !FileSystem.documentDirectory) return null;
  try {
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = getBaseDir() + fileName;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists ? fileUri : null;
  } catch (e) {
    console.error("Failed to get file locally", e);
    return null;
  }
};

export const deleteFileLocal = async (id: string) => {
  if (isWeb || !FileSystem.documentDirectory) return false;
  try {
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = getBaseDir() + fileName;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
    return true;
  } catch (e) {
    console.error("Failed to delete file locally", e);
    return false;
  }
};
