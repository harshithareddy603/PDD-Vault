import * as React from "react";
import { Checkbox as PaperCheckbox } from "react-native-paper";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Checkbox = ({ checked, onCheckedChange, disabled, style }: CheckboxProps) => {
  return (
    <View style={[styles.container, style]}>
      <PaperCheckbox.Android
        status={checked ? "checked" : "unchecked"}
        onPress={() => onCheckedChange?.(!checked)}
        disabled={disabled}
        color="#3b82f6"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
});

export { Checkbox };
