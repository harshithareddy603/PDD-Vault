import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const ToastViewport = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.viewport}>{children}</View>
);

const Toast = ({ children, variant = "default", style }: { 
  children: React.ReactNode; 
  variant?: "default" | "destructive";
  style?: ViewStyle;
}) => (
  <View style={[styles.toast, variant === "destructive" && styles.destructive, style]}>
    {children}
  </View>
);

const ToastTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const ToastDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const ToastClose = () => null;
const ToastAction = () => null;

const styles = StyleSheet.create({
  viewport: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    padding: 16,
    zIndex: 100,
  },
  toast: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  destructive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  description: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
