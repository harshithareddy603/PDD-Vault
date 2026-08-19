import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React from "react";
import { useNavigation, useRoute } from '@react-navigation/native';

interface NavLinkProps {
  to: string;
  children: (props: { isActive: boolean; isPending?: boolean }) => React.ReactNode;
  className?: any; // Kept for API compatibility
}

const NavLink = ({ to, children, className }: NavLinkProps) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // Handle both route names and path-like strings
  const routeName = to.startsWith('/') ? to.substring(1) : to;
  // Capitalize first letter if it matches common page names
  const normalizedRouteName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
  
  const isActive = route.name === normalizedRouteName || route.name === routeName;

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate(normalizedRouteName)}
      style={styles.container}
    >
      {children({ isActive, isPending: false })}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Flex and layout should be handled by the parent or child
  }
});

export { NavLink };
