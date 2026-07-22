import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ViewStyle, TextStyle, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Drawer = ({ open, onOpenChange, children }: { 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  );
};

const DrawerTrigger = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const DrawerContent = ({ children, style, onClose }: { children: React.ReactNode; style?: ViewStyle; onClose?: () => void }) => (
  <View style={styles.overlay}>
    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
    <View style={[styles.content, style]}>
      <View style={styles.handle} />
      {children}
    </View>
  </View>
);

const DrawerHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const DrawerFooter = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const DrawerTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const DrawerDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: SCREEN_HEIGHT * 0.4,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    gap: 12,
  },
});

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
