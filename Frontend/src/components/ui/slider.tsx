import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

const Slider = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.track}>
        <View style={styles.range} />
      </View>
      <View style={styles.thumb} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 20,
  },
  track: {
    height: 4,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  range: {
    height: "100%",
    width: "50%",
    backgroundColor: "#3b82f6",
  },
  thumb: {
    position: "absolute",
    left: "50%",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    marginLeft: -10,
  },
});

export { Slider };
