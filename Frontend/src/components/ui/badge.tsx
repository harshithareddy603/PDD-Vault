import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Badge = ({ children, variant = "default", style, textStyle }: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
}) => {
  return (
    <View style={[
      styles.badge, 
      variant === "default" && styles.default,
      variant === "secondary" && styles.secondary,
      variant === "destructive" && styles.destructive,
      variant === "outline" && styles.outline,
      style
    ]}>
      <Text style={[
        styles.text,
        variant === "outline" && styles.textOutline,
        (variant === "secondary") && { color: "#0f172a" },
        textStyle
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  default: {
    backgroundColor: "#3b82f6",
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: "#f1f5f9",
    borderColor: "transparent",
  },
  destructive: {
    backgroundColor: "#ef4444",
    borderColor: "transparent",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#e2e8f0",
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  textOutline: {
    color: "#0f172a",
  }
});

export { Badge };
