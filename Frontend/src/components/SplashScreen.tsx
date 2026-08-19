import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from "react";
import { ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface FloatingIconProps {
  iconName: keyof typeof Feather.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  isMaterial?: boolean;
  startX: number;
  startY: number;
  delay: number;
  color?: string;
  size?: number;
}

const FloatingFileIcon = ({ iconName, isMaterial, startX, startY, delay, color = "#93c5fd", size = 26 }: FloatingIconProps) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnim = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start(() => {
        startAnim(); // Loop floating animation continuously
      });
    };
    startAnim();
  }, [delay]);

  const translateX = anim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [startX, startX * 0.12, 0],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [startY, 8, -8],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.2, 0.75, 1],
    outputRange: [0.25, 1, 0.75, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 0.95, 0.85, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
        zIndex: 10,
      }}
    >
      {isMaterial ? (
        <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
      ) : (
        <Feather name={iconName as any} size={size} color={color} />
      )}
    </Animated.View>
  );
};

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Securing your local vault...");
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cloudPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Intro sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 30,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      // Cloud pulse when absorbing floating file icons
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloudPulse, {
            toValue: 1.14,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(cloudPulse, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    });

    // 5-second Progress Bar & Status Text Sequence
    const startTime = Date.now();
    const duration = 5000; // Compulsory 5 seconds

    const statusMessages = [
      "Securing your local vault...",
      "Encrypting family documents...",
      "Syncing ID cards & medical records...",
      "Finalizing AI OCR indexing...",
      "Vault ready! Launching..."
    ];

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      setProgress(currentProgress);

      const msgIndex = Math.min(
        Math.floor((elapsed / duration) * statusMessages.length),
        statusMessages.length - 1
      );
      setStatusText(statusMessages[msgIndex]);

      if (currentProgress >= 1) {
        clearInterval(timer);
      }
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.main, { opacity: fadeAnim }]}>
        
        {/* Animated Cloud Vault with 16 Floating File Type Particles */}
        <View style={styles.animationStage}>
          {/* Floating File Particles moving INTO Cloud Symbol */}
          <FloatingFileIcon iconName="file-text" startX={-130} startY={90} delay={0} color="#bfdbfe" size={28} />
          <FloatingFileIcon iconName="shield-check" isMaterial startX={130} startY={90} delay={200} color="#93c5fd" size={28} />
          <FloatingFileIcon iconName="card-account-details-outline" isMaterial startX={-140} startY={10} delay={400} color="#60a5fa" size={26} />
          <FloatingFileIcon iconName="image" startX={140} startY={10} delay={600} color="#93c5fd" size={26} />
          
          <FloatingFileIcon iconName="file-pdf-box" isMaterial startX={-90} startY={-90} delay={800} color="#fca5a5" size={28} />
          <FloatingFileIcon iconName="certificate" isMaterial startX={90} startY={-90} delay={1000} color="#fef08a" size={28} />
          <FloatingFileIcon iconName="hospital-box-outline" isMaterial startX={-150} startY={-40} delay={1200} color="#86efac" size={26} />
          <FloatingFileIcon iconName="car-info" isMaterial startX={150} startY={-40} delay={1400} color="#cbd5e1" size={26} />
          
          <FloatingFileIcon iconName="key-outline" isMaterial startX={0} startY={130} delay={1600} color="#fde047" size={28} />
          <FloatingFileIcon iconName="passport" isMaterial startX={0} startY={-130} delay={1800} color="#a7f3d0" size={28} />
          <FloatingFileIcon iconName="home-variant-outline" isMaterial startX={-110} startY={60} delay={2000} color="#ddd6fe" size={26} />
          <FloatingFileIcon iconName="school-outline" isMaterial startX={110} startY={60} delay={2200} color="#bae6fd" size={26} />
          
          <FloatingFileIcon iconName="cash-multiple" isMaterial startX={-60} startY={110} delay={2400} color="#86efac" size={26} />
          <FloatingFileIcon iconName="folder-lock" isMaterial startX={60} startY={110} delay={2600} color="#fed7aa" size={26} />
          <FloatingFileIcon iconName="star-circle-outline" isMaterial startX={-70} startY={-110} delay={2800} color="#fef08a" size={26} />
          <FloatingFileIcon iconName="file-search-outline" isMaterial startX={70} startY={-110} delay={3000} color="#93c5fd" size={26} />

          {/* Central Cloud Symbol */}
          <Animated.View
            style={[
              styles.cloudContainer,
              { transform: [{ scale: cloudPulse }] }
            ]}
          >
            <MaterialCommunityIcons name="cloud-upload" size={104} color="#FFFFFF" />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { transform: [{ scale: scaleAnim }] }]}>
          Smart Docs
        </Animated.Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.loadingText}>{statusText}</Text>
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
  animationStage: {
    position: 'relative',
    width: 260,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cloudContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
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

export default SplashScreen;
