import * as React from "react";
import { View, Text, TextInput, StyleSheet, ViewStyle } from "react-native";

const InputOTP = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.container, style]}>{children}</View>
);

const InputOTPGroup = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.group, style]}>{children}</View>
);

const InputOTPSlot = ({ index, style }: { index: number; style?: ViewStyle }) => (
  <View style={[styles.slot, style]}>
    <TextInput 
      style={styles.input} 
      keyboardType="number-pad" 
      maxLength={1}
    />
  </View>
);

const InputOTPSeparator = () => (
  <View style={styles.separator}>
    <Text style={styles.separatorText}>•</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  input: {
    fontSize: 18,
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  separator: {
    paddingHorizontal: 4,
  },
  separatorText: {
    fontSize: 20,
    color: "#64748b",
  },
});

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
