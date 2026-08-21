import React, { useEffect, useRef, useState } from 'react';
import Animated, { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// @ts-ignore
type StyleProp<T> = any;
// @ts-ignore
type ViewStyle = any;
// @ts-ignore
const Easing = Animated.Easing || (Animated as any).easing;
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// ─── 1. AnimatedCard (Staggered Entrance + Web Hover Scale) ─────────────────
interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, index = 0, delay, style, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const hoverScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const calcDelay = delay !== undefined ? delay : Math.min(index * 60, 400);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, calcDelay);

    return () => clearTimeout(timer);
  }, [index, delay]);

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      Animated.timing(hoverScaleAnim, {
        toValue: 1.015,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      Animated.timing(hoverScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const scaleTotal = Platform.OS === 'web'
    ? Animated.multiply(scaleAnim, hoverScaleAnim)
    : scaleAnim;

  const content = (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleTotal },
          ],
        },
        style,
      ]}
      // @ts-ignore
      onMouseEnter={handleHoverIn}
      // @ts-ignore
      onMouseLeave={handleHoverOut}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// ─── 2. AnimatedBadge (Soon Expiry Pulse) ──────────────────────────────────
interface AnimatedBadgeProps {
  status: 'safe' | 'soon' | 'expired';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ status, children, style }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'soon') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status]);

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ─── 3. AnimatedFAB (Morphing + -> × with secondary options) ─────────────
interface AnimatedFABProps {
  onTakePhoto?: () => void;
  onGalleryPhoto?: () => void;
  onBrowseFiles?: () => void;
  onScan?: () => void;
  onUpload?: () => void;
  onAddManual?: () => void;
}

export const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  onTakePhoto,
  onGalleryPhoto,
  onBrowseFiles,
  onScan,
  onUpload,
  onAddManual,
}) => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleFAB = () => {
    const nextState = !open;
    setOpen(nextState);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: nextState ? 1 : 0,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(menuAnim, {
        toValue: nextState ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const translateY1 = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -70] });
  const translateY2 = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -125] });
  const translateY3 = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -180] });

  const handleTakePhotoClick = () => {
    toggleFAB();
    if (onTakePhoto) onTakePhoto();
    else if (onScan) onScan();
  };

  const handleGalleryPhotoClick = () => {
    toggleFAB();
    if (onGalleryPhoto) onGalleryPhoto();
    else if (onUpload) onUpload();
  };

  const handleBrowseFilesClick = () => {
    toggleFAB();
    if (onBrowseFiles) onBrowseFiles();
    else if (onAddManual) onAddManual();
  };

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      {/* Secondary Actions */}
      {/* 1. Take Photo (Top) */}
      <Animated.View
        style={[
          styles.secondaryBtnContainer,
          {
            opacity: menuAnim,
            transform: [{ translateY: translateY3 }, { scale: menuAnim }],
          },
        ]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: '#8B5CF6' }]} onPress={handleTakePhotoClick}>
          <Feather name="camera" size={18} color="#FFF" />
          <Text style={styles.secondaryLabel}>Take Photo</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 2. Gallery / Photo (Middle) */}
      <Animated.View
        style={[
          styles.secondaryBtnContainer,
          {
            opacity: menuAnim,
            transform: [{ translateY: translateY2 }, { scale: menuAnim }],
          },
        ]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: '#06B6D4' }]} onPress={handleGalleryPhotoClick}>
          <Feather name="image" size={18} color="#FFF" />
          <Text style={styles.secondaryLabel}>Gallery / Photo</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Browse Files (Bottom) */}
      <Animated.View
        style={[
          styles.secondaryBtnContainer,
          {
            opacity: menuAnim,
            transform: [{ translateY: translateY1 }, { scale: menuAnim }],
          },
        ]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: '#10B981' }]} onPress={handleBrowseFilesClick}>
          <Feather name="folder" size={18} color="#FFF" />
          <Text style={styles.secondaryLabel}>Browse Files</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Trigger FAB */}
      <TouchableOpacity style={styles.fabMain} onPress={toggleFAB} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Feather name="plus" size={28} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ─── 4. AnimatedScannerLine ───────────────────────────────────────────────────
export const AnimatedScannerLine: React.FC = () => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 230],
  });

  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
  );
};

// ─── 5. AnimatedNotificationBell ──────────────────────────────────────────────
interface AnimatedNotificationBellProps {
  hasNotif: boolean;
  onPress: () => void;
}

export const AnimatedNotificationBell: React.FC<AnimatedNotificationBellProps> = ({ hasNotif, onPress }) => {
  const { colors } = useTheme();
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(hasNotif ? 1 : 0)).current;

  useEffect(() => {
    if (hasNotif) {
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(wiggleAnim, { toValue: 0.5, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();

      Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: Platform.OS !== 'web' }).start();
    } else {
      Animated.timing(badgeScale, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start();
    }
  }, [hasNotif]);

  const rotation = wiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '18deg'],
  });

  return (
    <TouchableOpacity style={styles.iconBtn} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Feather name="bell" size={20} color={colors.text} />
      </Animated.View>

      {hasNotif && (
        <Animated.View style={[styles.badgeDot, { transform: [{ scale: badgeScale }] }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 85,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 99,
  },
  fabMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryBtnContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  secondaryLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
