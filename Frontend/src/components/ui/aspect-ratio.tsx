import * as React from "react";
import { View, ViewStyle } from "react-native";

const AspectRatio = ({ ratio, children, style }: { ratio: number; children: React.ReactNode; style?: ViewStyle }) => {
  return <View style={[{ aspectRatio: ratio }, style]}>{children}</View>;
};

export { AspectRatio };
