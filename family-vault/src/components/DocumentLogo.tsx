import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState } from "react";
import { 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Ionicons, 
  Feather, 
  FontAwesome 
} from '@expo/vector-icons';

interface DocumentLogoProps {
  name: string;
  category: string;
  source: string | null;
  size?: number;
}

export const DocumentLogo = ({ name, category, source, size = 24 }: DocumentLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const s = source?.toLowerCase() || "";
  
  const getLogoUrl = () => {
    // Official high-reliability logos
    const logos: Record<string, string> = {
      aadhaar: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/100px-Aadhaar_Logo.svg.png",
      pan: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Income_Tax_Department_India_Logo.png/100px-Income_Tax_Department_India_Logo.png",
      passport: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Emblem_of_India.svg/100px-Emblem_of_India.svg.png",
      voter: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Election_Commission_of_India_logo.svg/100px-Election_Commission_of_India_logo.svg.png",
      license: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png/100px-Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png"
    };

    // Use a robust proxy with caching and SSL to ensure these load every time
    const proxy = (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&cbg=white&errorgradient=true`;

    if (s === "aadhaar" || n.includes("aadhaar") || n.includes("adhar") || c.includes("aadhaar")) return proxy(logos.aadhaar);
    if (s === "pan" || n.includes("pan card") || (n.includes("pan") && n.length < 10) || c.includes("pan")) return proxy(logos.pan);
    if (s === "passport" || n.includes("passport") || c.includes("passport")) return proxy(logos.passport);
    if (s === "voter_id" || n.includes("voter") || c.includes("voter")) return proxy(logos.voter);
    if (s === "license" || n.includes("license") || c.includes("driving")) return proxy(logos.license);

    return null;
  };

  const url = getLogoUrl();

  if (url && !imgError) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.whiteBg]}>
        <Image 
          source={{ uri: url }} 
          style={styles.image}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
      </View>
    );
  }

  // Fallback Icons with premium colors
  if (s === "aadhaar" || n.includes("aadhaar") || n.includes("adhar") || c.includes("aadhaar")) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.purpleBg]}>
        <MaterialCommunityIcons name="fingerprint" size={size * 0.6} color="#9333ea" />
      </View>
    );
  }
  if (s === "pan" || n.includes("pan card") || (n.includes("pan") && n.length < 10) || c.includes("pan")) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.blueBg]}>
        <MaterialCommunityIcons name="bank" size={size * 0.6} color="#2563eb" />
      </View>
    );
  }
  if (s === "passport" || n.includes("passport") || c.includes("passport")) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.skyBg]}>
        <Ionicons name="globe-outline" size={size * 0.6} color="#0284c7" />
      </View>
    );
  }
  if (s === "voter_id" || n.includes("voter") || c.includes("voter")) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.tealBg]}>
        <FontAwesome name="id-card-o" size={size * 0.6} color="#0d9488" />
      </View>
    );
  }
  if (s === "license" || n.includes("license") || c.includes("driving")) {
    return (
      <View style={[styles.container, { width: size, height: size }, styles.amberBg]}>
        <FontAwesome5 name="car" size={size * 0.6} color="#d97706" />
      </View>
    );
  }

  // Category fallbacks
  const getIcon = () => {
    if (c === "medical" || n.includes("medical") || n.includes("health")) {
      return { icon: <MaterialCommunityIcons name="heart-pulse" size={size * 0.6} color="#f43f5e" />, colorStyle: styles.roseBg };
    }
    if (c === "property" || n.includes("house") || n.includes("land")) {
      return { icon: <MaterialCommunityIcons name="office-building" size={size * 0.6} color="#6366f1" />, colorStyle: styles.indigoBg };
    }
    if (c === "education" || n.includes("degree") || n.includes("marks")) {
      return { icon: <FontAwesome5 name="graduation-cap" size={size * 0.6} color="#10b981" />, colorStyle: styles.emeraldBg };
    }
    if (c === "insurance" || n.includes("policy")) {
      return { icon: <FontAwesome5 name="car" size={size * 0.6} color="#f59e0b" />, colorStyle: styles.amberBg };
    }
    if (c === "id") {
      return { icon: <MaterialCommunityIcons name="fingerprint" size={size * 0.6} color="#94a3b8" />, colorStyle: styles.slateBg };
    }
    return { icon: <Feather name="file-text" size={size * 0.6} color="#3b82f6" />, colorStyle: styles.lightBlueBg };
  };

  const { icon, colorStyle } = getIcon();
  return (
    <View style={[styles.container, { width: size, height: size }, colorStyle]}>
      {icon}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    overflow: 'hidden',
  },
  whiteBg: { backgroundColor: '#FFFFFF' },
  purpleBg: { backgroundColor: '#FAF5FF' },
  blueBg: { backgroundColor: '#EFF6FF' },
  skyBg: { backgroundColor: '#F0F9FF' },
  tealBg: { backgroundColor: '#F0FDFA' },
  amberBg: { backgroundColor: '#FFFBEB' },
  roseBg: { backgroundColor: '#FFF1F2' },
  indigoBg: { backgroundColor: '#EEF2FF' },
  emeraldBg: { backgroundColor: '#ECFDF5' },
  slateBg: { backgroundColor: '#F8FAFC' },
  lightBlueBg: { backgroundColor: '#EFF6FF' },
  image: {
    width: '100%',
    height: '100%',
  },
});
