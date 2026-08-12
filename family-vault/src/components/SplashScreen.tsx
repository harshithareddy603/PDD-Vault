import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from "react";
import { ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ultra-smooth intro sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 9,
        tension: 30,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      // Subtle premium breathing pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    });

    // Simulate a loading bar animation
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 1) {
          clearInterval(timer);
          return 1;
        }
        const diff = Math.random() * 0.15;
        const next = oldProgress + diff;
        return next > 0.9 ? 0.9 : next; // Cap at 90%
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.main, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }
          ]}
        >
          <Feather name="file-text" size={80} color="#fff" />
          <View style={styles.cloudIcon}>
            <MaterialCommunityIcons name="cloud" size={40} color="#fff" />
          </View>
        </Animated.View>
        
        <Animated.Text style={[styles.title, { transform: [{ scale: scaleAnim }] }]}>
          Smart Docs
        </Animated.Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.loadingText}>Preparing your family vault...</Text>
          <ProgressBar 
            progress={progress} 
            color="#FFFFFF" 
            style={styles.progressBar}
          />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Doc Base • PDD Family Vault</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // absoluteFillObject needs a positioned parent with height; on web use minHeight instead
    ...(Platform.OS === 'web'
      ? { minHeight: '100vh' as any, width: '100%' as any }
      : StyleSheet.absoluteFillObject),
    backgroundColor: '#4a3aff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 400,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  cloudIcon: {
    position: 'absolute',
    bottom: -8,
    left: -8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
});
