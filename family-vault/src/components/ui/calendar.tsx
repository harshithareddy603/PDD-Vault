import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

export type CalendarProps = any;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calendar Placeholder</Text>
      <Text style={styles.subtext}>Use a native date picker or react-native-calendars for full functionality.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  subtext: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
});

export { Calendar };
