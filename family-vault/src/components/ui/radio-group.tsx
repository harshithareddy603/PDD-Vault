import * as React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

const RadioGroup = ({ children, style, value, onValueChange }: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  return (
    <View style={[styles.group, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selected: (child.props as any).value === value,
            onSelect: () => onValueChange?.((child.props as any).value),
          });
        }
        return child;
      })}
    </View>
  );
};

const RadioGroupItem = ({ 
  selected, 
  onSelect,
  style 
}: { 
  value: string;
  selected?: boolean;
  onSelect?: () => void;
  style?: ViewStyle;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.item, selected && styles.itemSelected, style]} 
      onPress={onSelect}
    >
      {selected && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  item: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelected: {
    borderColor: "#3b82f6",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },
});

export { RadioGroup, RadioGroupItem };
