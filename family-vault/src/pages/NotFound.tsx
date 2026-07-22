import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect } from "react";
import { useNavigation } from '@react-navigation/native';

const NotFound = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});

export default NotFound;
