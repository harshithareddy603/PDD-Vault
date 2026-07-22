import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Accordion = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.accordion, style]}>{children}</View>
);

const AccordionItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.item, style]}>{children}</View>
);

const AccordionTrigger = ({ 
  children, 
  isOpen, 
  onToggle,
  style 
}: { 
  children: React.ReactNode; 
  isOpen?: boolean;
  onToggle?: () => void;
  style?: ViewStyle;
}) => (
  <TouchableOpacity 
    style={[styles.trigger, style]} 
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle?.();
    }}
  >
    <Text style={styles.triggerText}>{children}</Text>
    <Feather 
      name="chevron-down" 
      size={16} 
      color="#64748B" 
      style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }} 
    />
  </TouchableOpacity>
);

const AccordionContent = ({ 
  children, 
  isOpen,
  style 
}: { 
  children: React.ReactNode; 
  isOpen?: boolean;
  style?: ViewStyle;
}) => {
  if (!isOpen) return null;
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    width: "100%",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  content: {
    paddingBottom: 16,
  },
});

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
