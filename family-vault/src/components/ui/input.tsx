import * as React from "react";
import { TextInput, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input = ({ value, onChangeText, placeholder, secureTextEntry, keyboardType, style, inputStyle }: InputProps) => {
  return (
    <TextInput
      style={[styles.input, style, inputStyle]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      placeholderTextColor="#94a3b8"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0f172a",
  },
});

export { Input };
