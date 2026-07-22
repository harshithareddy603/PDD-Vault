import * as React from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";

const ScrollArea = ({ 
  children, 
  style, 
  horizontal = false 
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  horizontal?: boolean;
}) => (
  <ScrollView 
    style={[styles.container, style]} 
    horizontal={horizontal}
    showsVerticalScrollIndicator={!horizontal}
    showsHorizontalScrollIndicator={horizontal}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { ScrollArea };
