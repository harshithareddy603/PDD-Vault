import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ViewStyle, TextStyle } from "react-native";

const AlertDialog = ({ open, onOpenChange, children }: { 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  );
};

const AlertDialogTrigger = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const AlertDialogContent = ({ children, style, onClose }: { children: React.ReactNode; style?: ViewStyle; onClose?: () => void }) => (
  <View style={styles.overlay}>
    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
    <View style={[styles.content, style]}>
      {children}
    </View>
  </View>
);

const AlertDialogHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const AlertDialogFooter = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const AlertDialogTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const AlertDialogDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const AlertDialogAction = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.action, style]}>
    <Text style={styles.actionText}>{children}</Text>
  </TouchableOpacity>
);

const AlertDialogCancel = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.cancel, style]}>
    <Text style={styles.cancelText}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  action: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  cancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "500",
  },
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
