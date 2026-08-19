import * as React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";

const Collapsible = ({ open, onOpenChange, children }: { 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return <View>{children}</View>;
};

const CollapsibleTrigger = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const CollapsibleContent = ({ children, open, style }: { children: React.ReactNode; open?: boolean; style?: ViewStyle }) => {
  if (!open) return null;
  return <View style={style}>{children}</View>;
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
