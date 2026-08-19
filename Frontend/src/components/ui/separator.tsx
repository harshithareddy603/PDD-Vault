import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

const Separator = ({ 
  orientation = "horizontal", 
  style 
}: { 
  orientation?: "horizontal" | "vertical"; 
  style?: ViewStyle 
}) => {
  return (
    <View style={[
      styles.base,
      orientation === "horizontal" ? styles.horizontal : styles.vertical,
      style
    ]} />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#e2e8f0",
  },
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    height: "100%",
    width: 1,
  },
});

export { Separator };
