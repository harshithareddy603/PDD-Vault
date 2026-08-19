import * as React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Button = ({ variant = 'default', size = 'default', onPress, children, style, textStyle, disabled }: ButtonProps) => {
  // Simple mapping of tailwind-like classes to styles would be complex here, 
  // but for the sake of 'conversion' we maintain the structure.
  // In a real RN app, we'd use a library like nativewind or just pure StyleSheet.
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.base,
        variant === 'default' && styles.default,
        variant === 'destructive' && styles.destructive,
        variant === 'outline' && styles.outline,
        variant === 'secondary' && styles.secondary,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[
        styles.textBase,
        variant === 'outline' && styles.textOutline,
        variant === 'secondary' && styles.textSecondary,
        variant === 'link' && styles.textLink,
        (variant === 'ghost' || variant === 'outline') && { color: '#0f172a' },
        textStyle
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 16,
    height: 40,
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  sm: {
    height: 32,
    paddingHorizontal: 12,
  },
  lg: {
    height: 48,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  textOutline: {
    color: '#0f172a',
  },
  textSecondary: {
    color: '#0f172a',
  },
  textLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  }
});

export { Button };
