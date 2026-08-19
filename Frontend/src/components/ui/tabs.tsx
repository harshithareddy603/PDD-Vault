import * as React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Tabs = ({ children, value, onValueChange, style }: { 
  children: React.ReactNode; 
  value?: string; 
  onValueChange?: (value: string) => void;
  style?: ViewStyle;
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View style={[styles.tabs, style]}>{children}</View>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.list, style]}>{children}</View>
);

const TabsTrigger = ({ children, value, style }: { children: React.ReactNode; value: string; style?: ViewStyle }) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <TouchableOpacity 
      onPress={() => onValueChange?.(value)}
      style={[
        styles.trigger, 
        isActive && styles.activeTrigger,
        style
      ]}
    >
      <Text style={[
        styles.triggerText,
        isActive && styles.activeTriggerText
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const TabsContent = ({ children, value, style }: { children: React.ReactNode; value: string; style?: ViewStyle }) => {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <View style={[styles.content, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  tabs: {
    width: "100%",
  },
  list: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  trigger: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  activeTrigger: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTriggerText: {
    color: "#0f172a",
  },
  content: {
    marginTop: 8,
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
