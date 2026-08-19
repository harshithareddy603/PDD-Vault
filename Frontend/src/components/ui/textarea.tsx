import * as React from "react";
import { TextInput, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface TextareaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  numberOfLines?: number;
}

const Textarea = ({ value, onChangeText, placeholder, style, inputStyle, numberOfLines = 4 }: TextareaProps) => {
  return (
    <TextInput
      style={[styles.textarea, style, inputStyle]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={true}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      placeholderTextColor="#94a3b8"
    />
  );
};

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0f172a",
  },
});

export { Textarea };
