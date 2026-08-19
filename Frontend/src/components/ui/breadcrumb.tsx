import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const Breadcrumb = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.breadcrumb, style]}>{children}</View>
);

const BreadcrumbList = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.list, style]}>{children}</View>
);

const BreadcrumbItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.item, style]}>{children}</View>
);

const BreadcrumbLink = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={styles.linkText}>{children}</Text>
  </TouchableOpacity>
);

const BreadcrumbPage = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.pageText, style]}>{children}</Text>
);

const BreadcrumbSeparator = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.separator}>
    {children ?? <Feather name="chevron-right" size={14} color="#64748B" />}
  </View>
);

const BreadcrumbEllipsis = () => (
  <View style={styles.ellipsis}>
    <Feather name="more-horizontal" size={16} color="#64748B" />
  </View>
);

const styles = StyleSheet.create({
  breadcrumb: {
    paddingVertical: 8,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    fontSize: 14,
    color: "#64748B",
  },
  pageText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0F172A",
  },
  separator: {
    marginHorizontal: 4,
  },
  ellipsis: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
