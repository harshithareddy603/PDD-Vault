import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

const Progress = ({ value = 0, style }: { value?: number; style?: ViewStyle }) => {
  return (
    <View style={[styles.progress, style]}>
      <View 
        style={[
          styles.indicator, 
          { width: `${Math.min(Math.max(value, 0), 100)}%` }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progress: {
    height: 8,
    width: "100%",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
});

export { Progress };
