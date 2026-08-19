import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native'
import React, { useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { useNavigation } from '@react-navigation/native';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useSession();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigation.replace("Auth");
    }
  }, [loading, isAuthenticated, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  }
});
