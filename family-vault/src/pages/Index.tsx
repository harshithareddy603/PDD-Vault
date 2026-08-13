import React, { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { SplashScreen } from "../components/SplashScreen";
import { useNavigation } from '@react-navigation/native';

let hasPlayedSplashGlobal = false;

const Index = () => {
  const { isAuthenticated, loading } = useSession();
  const [showSplash, setShowSplash] = useState(!hasPlayedSplashGlobal);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!hasPlayedSplashGlobal) {
      const timer = setTimeout(() => {
        hasPlayedSplashGlobal = true;
        setShowSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!loading && !showSplash) {
      navigation.replace(isAuthenticated ? "Dashboard" : "Auth");
    }
  }, [loading, showSplash, isAuthenticated, navigation]);

  if (showSplash) return <SplashScreen />;
  
  return null;
};

export default Index;
