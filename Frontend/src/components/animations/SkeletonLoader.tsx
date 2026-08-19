import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, DimensionValue } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export const SkeletonText = ({ width = '100%', height = 16, borderRadius = 4, style }: SkeletonProps) => {
  const { isDark } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  const bg = isDark ? '#1E293B' : '#E2E8F0';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bg,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export const SkeletonAvatar = ({ size = 44, borderRadius = 22, style }: { size?: number; borderRadius?: number; style?: any }) => {
  return <SkeletonText width={size} height={size} borderRadius={borderRadius} style={style} />;
};

export const SkeletonStatCard = () => {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <SkeletonText width={90} height={14} />
        <SkeletonAvatar size={36} borderRadius={10} />
      </View>
      <SkeletonText width={50} height={28} style={{ marginBottom: 6 }} />
      <SkeletonText width={110} height={12} />
    </View>
  );
};

export const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <SkeletonAvatar size={40} borderRadius={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonText width="70%" height={16} />
          <SkeletonText width="40%" height={12} />
        </View>
        <SkeletonText width={60} height={20} borderRadius={12} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <SkeletonText width={80} height={12} />
        <SkeletonText width={40} height={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
});
