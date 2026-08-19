import * as React from "react";
import { Switch as NativeSwitch, StyleSheet, View, ViewStyle } from "react-native";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Switch = ({ checked, onCheckedChange, disabled, style }: SwitchProps) => {
  return (
    <View style={[styles.container, style]}>
      <NativeSwitch
        value={checked}
        onValueChange={onCheckedChange}
        disabled={disabled}
        trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
        thumbColor={checked ? "#ffffff" : "#f4f4f4"}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
});

export { Switch };
