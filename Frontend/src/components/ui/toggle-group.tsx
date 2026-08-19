import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Toggle } from "@/components/ui/toggle";

const ToggleGroup = ({ 
  children, 
  style, 
  value, 
  onValueChange,
  variant = "default",
  size = "default"
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  value?: string | string[];
  onValueChange?: (value: any) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}) => {
  const isSingle = typeof value === "string" || value === undefined;

  const handleToggle = (itemValue: string) => {
    if (isSingle) {
      onValueChange?.(itemValue);
    } else {
      const values = Array.isArray(value) ? value : [];
      if (values.includes(itemValue)) {
        onValueChange?.(values.filter(v => v !== itemValue));
      } else {
        onValueChange?.([...values, itemValue]);
      }
    }
  };

  return (
    <View style={[styles.group, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const itemValue = (child.props as any).value;
          const isPressed = isSingle ? value === itemValue : (value as string[]).includes(itemValue);
          
          return React.cloneElement(child as React.ReactElement<any>, {
            pressed: isPressed,
            onPressedChange: () => handleToggle(itemValue),
            variant,
            size,
          });
        }
        return child;
      })}
    </View>
  );
};

const ToggleGroupItem = ({ 
  children,
  pressed,
  onPressedChange,
  variant,
  size,
  style 
}: { 
  value: string;
  children: React.ReactNode;
  pressed?: boolean;
  onPressedChange?: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  style?: ViewStyle;
}) => {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      variant={variant}
      size={size}
      style={style}
    >
      {children}
    </Toggle>
  );
};

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});

export { ToggleGroup, ToggleGroupItem };
