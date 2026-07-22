import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

const ResizablePanelGroup = ({ 
  children, 
  direction = "horizontal", 
  style 
}: { 
  children: React.ReactNode; 
  direction?: "horizontal" | "vertical";
  style?: ViewStyle;
}) => (
  <View style={[
    styles.group, 
    direction === "vertical" ? styles.vertical : styles.horizontal,
    style
  ]}>
    {children}
  </View>
);

const ResizablePanel = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.panel, style]}>{children}</View>
);

const ResizableHandle = () => null;

const styles = StyleSheet.create({
  group: {
    flex: 1,
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
  panel: {
    flex: 1,
  },
});

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
