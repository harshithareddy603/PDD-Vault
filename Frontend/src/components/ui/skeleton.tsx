import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

function Skeleton({ style }: { style?: ViewStyle }) {
  return <View style={[styles.skeleton, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
});

export { Skeleton };
