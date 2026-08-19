import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Alert = ({ children, variant = "default", style }: { 
  children: React.ReactNode; 
  variant?: "default" | "destructive";
  style?: ViewStyle;
}) => {
  return (
    <View style={[
      styles.alert, 
      variant === "destructive" && styles.destructive,
      style
    ]}>
      {children}
    </View>
  );
};

const AlertTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const AlertDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  alert: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  destructive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});

export { Alert, AlertTitle, AlertDescription };
