import * as React from "react";
import { View, StyleSheet, Modal, TouchableOpacity, ViewStyle } from "react-native";

const Popover = ({ open, onOpenChange, children }: { 
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

const PopoverTrigger = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const PopoverContent = ({ children, style, onClose }: { children: React.ReactNode; style?: ViewStyle; onClose?: () => void }) => (
  <View style={styles.overlay}>
    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
    <View style={[styles.content, style]}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  content: {
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
    minWidth: 200,
  },
});

export { Popover, PopoverTrigger, PopoverContent };
