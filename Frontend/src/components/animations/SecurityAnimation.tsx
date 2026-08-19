import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SecurityAnimationProps {
  onComplete?: () => void;
  statusText?: string;
  duration?: number;
}

export const SecurityAnimation = ({ onComplete, statusText, duration = 2400 }: SecurityAnimationProps) => {
  const { colors, isDark } = useTheme();
  const [stage, setStage] = useState<'lock' | 'shield' | 'check'>('lock');
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stage 1: Lock Icon (0 - 800ms)
    setStage('lock');
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Stage 2: Shield Icon (800ms - 1600ms)
    const t1 = setTimeout(() => {
      setStage('shield');
      scaleAnim.setValue(0.7);
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 5,
        tension: 45,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, 800);

    // Stage 3: Checkmark Icon (1600ms - 2400ms)
    const t2 = setTimeout(() => {
      setStage('check');
      scaleAnim.setValue(0.5);
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 4,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        if (onComplete) onComplete();
      });
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View
        style={[
          styles.iconCircle,
          {
            backgroundColor: stage === 'check' ? (isDark ? '#064E3B' : '#DCFCE7') : stage === 'shield' ? (isDark ? '#1E3A8A' : '#DBEAFE') : (isDark ? '#312E81' : '#EDE9FE'),
            transform: [{ scale: scaleAnim }, { rotate: spin }],
            opacity: opacityAnim,
          },
        ]}
      >
        {stage === 'lock' && (
          <Feather name="lock" size={32} color={isDark ? '#818CF8' : '#4F46E5'} />
        )}
        {stage === 'shield' && (
          <MaterialCommunityIcons name="shield-check" size={36} color={isDark ? '#60A5FA' : '#2563EB'} />
        )}
        {stage === 'check' && (
          <Feather name="check" size={36} color={isDark ? '#34D399' : '#16A34A'} />
        )}
      </Animated.View>

      <Text style={[styles.statusText, { color: colors.text }]}>
        {statusText || (stage === 'lock' ? 'Encrypting Credentials...' : stage === 'shield' ? 'Securing Local Vault...' : 'Vault Verified & Protected!')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
