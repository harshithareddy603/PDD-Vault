import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const NavigationMenu = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.menu, style]}>{children}</View>
);

const NavigationMenuList = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.list, style]}>{children}</View>
);

const NavigationMenuItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={style}>{children}</View>
);

const NavigationMenuTrigger = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.trigger, style]}>
    <Text style={styles.triggerText}>{children}</Text>
    <Feather name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
  </TouchableOpacity>
);

const NavigationMenuContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>{children}</View>
);

const NavigationMenuLink = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, style]}>
    <Text style={styles.linkText}>{children}</Text>
  </TouchableOpacity>
);

const NavigationMenuViewport = () => null;
const NavigationMenuIndicator = () => null;

const styles = StyleSheet.create({
  menu: {
    width: "100%",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#64748B",
  },
});

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuIndicator,
};
