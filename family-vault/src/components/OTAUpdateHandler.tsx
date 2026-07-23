import React, { useEffect, useState } from 'react';
import {
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Updates from 'expo-updates';

export const OTAUpdateHandler: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0.85)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Animate the card in when modal becomes visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 16,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function checkAndApplyUpdates() {
      try {
        if (__DEV__) {
          console.log('[OTAUpdateHandler] Dev mode — skipping OTA check.');
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('[OTAUpdateHandler] New update found. Fetching…');
          const fetchResult = await Updates.fetchUpdateAsync();
          if (fetchResult.isNew) {
            setVisible(true);
          }
        }
      } catch (error) {
        console.error('[OTAUpdateHandler] OTA check error:', error);
      }
    }

    checkAndApplyUpdates();
  }, []);

  const handleRestart = async () => {
    setApplying(true);
    await Updates.reloadAsync();
  };

  const handleLater = () => {
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleLater}
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Icon badge */}
          <View style={styles.iconBadge}>
            <Text style={styles.iconEmoji}>⚡</Text>
          </View>

          <Text style={styles.title}>Update Ready</Text>
          <Text style={styles.subtitle}>
            A new version of Smart Docs has been downloaded and is ready to
            install. Restart now for the latest improvements.
          </Text>

          {/* Primary button */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, applying && styles.btnDisabled]}
            onPress={handleRestart}
            disabled={applying}
            activeOpacity={0.82}
          >
            {applying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>⟳  Update & Restart</Text>
            )}
          </TouchableOpacity>

          {/* Secondary button */}
          {!applying && (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleLater}
              activeOpacity={0.7}
            >
              <Text style={styles.btnSecondaryText}>Remind me later</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 28, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#12102A',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    // subtle glow border
    borderWidth: 1,
    borderColor: 'rgba(105, 80, 255, 0.35)',
    shadowColor: '#6950FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 20,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(105, 80, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(105, 80, 255, 0.4)',
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    color: '#A8A3C8',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#6950FF',
    shadowColor: '#6950FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  btnSecondary: {
    marginTop: 14,
    paddingVertical: 10,
  },
  btnSecondaryText: {
    color: '#6B6890',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OTAUpdateHandler;
