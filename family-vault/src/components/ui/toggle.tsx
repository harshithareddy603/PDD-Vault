import * as React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Toggle = ({ 
  pressed, 
  onPressedChange, 
  children,
  variant = "default",
  size = "default",
  style 
}: { 
  pressed?: boolean; 
  onPressedChange?: (pressed: boolean) => void;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  style?: ViewStyle;
}) => {
  const containerStyle = [
    styles.base,
    variant === "outline" && styles.outline,
    size === "sm" && styles.sm,
    size === "lg" && styles.lg,
    pressed && styles.pressed,
    style
  ];

  const textStyle = [
    styles.text,
    pressed && styles.textPressed
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={() => onPressedChange?.(!pressed)}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "transparent",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sm: {
    height: 36,
    paddingHorizontal: 10,
  },
  lg: {
    height: 44,
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  textPressed: {
    color: "#3b82f6",
  },
});

export { Toggle };
