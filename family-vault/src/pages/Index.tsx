import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { SplashScreen } from "../components/SplashScreen";
import { useNavigation } from '@react-navigation/native';

const Index = () => {
  const { isAuthenticated, loading } = useSession();
  const [showSplash, setShowSplash] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !showSplash) {
      navigation.replace(isAuthenticated ? "Dashboard" : "Auth");
    }
  }, [loading, showSplash, isAuthenticated, navigation]);

  if (loading || showSplash) return <SplashScreen />;
  
  return null;
};

export default Index;
