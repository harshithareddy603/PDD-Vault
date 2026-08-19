import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ViewStyle, TextStyle, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Sheet = ({ open, onOpenChange, children }: { 
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

const SheetContent = ({ 
  side = "right", 
  children, 
  onClose,
  style 
}: { 
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  onClose?: () => void;
  style?: ViewStyle;
}) => {
  const contentStyle = [
    styles.content,
    side === "top" && styles.top,
    side === "bottom" && styles.bottom,
    side === "left" && styles.left,
    side === "right" && styles.right,
    style
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={contentStyle}>
        {children}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SheetHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const SheetTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const SheetDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const SheetFooter = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
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
    position: "absolute",
    padding: 24,
  },
  top: {
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.75,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.75,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  header: {
    marginBottom: 16,
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
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
