import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Updates from 'expo-updates';

export const OTAUpdateHandler: React.FC = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function checkAndApplyUpdates() {
      try {
        // In local development, updates check is typically disabled or behaves differently.
        if (__DEV__) {
          console.log('[OTAUpdateHandler] Running in development mode, skipping OTA check.');
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('[OTAUpdateHandler] New update available. Fetching...');
          const fetchResult = await Updates.fetchUpdateAsync();
          if (fetchResult.isNew) {
            Alert.alert(
              'Update Available',
              'A new version of the app is ready. Restart now to apply?',
              [
                { text: 'Later', style: 'cancel' },
                { 
                  text: 'Restart', 
                  onPress: async () => {
                    await Updates.reloadAsync();
                  } 
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('[OTAUpdateHandler] Error checking for OTA updates:', error);
      }
    }

    checkAndApplyUpdates();
  }, []);

  return null;
};

export default OTAUpdateHandler;
