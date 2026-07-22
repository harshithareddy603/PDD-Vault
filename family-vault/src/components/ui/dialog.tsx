import * as React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const Dialog = ({ children, open, onOpenChange }: { 
  children: React.ReactNode; 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void 
}) => {
  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </Modal>
  );
};

const DialogContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>
    {children}
  </View>
);

const DialogHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const DialogFooter = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const DialogTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const DialogDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
});

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
