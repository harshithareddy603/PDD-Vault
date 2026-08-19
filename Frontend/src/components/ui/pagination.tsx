import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const Pagination = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.pagination, style]}>{children}</View>
);

const PaginationContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>{children}</View>
);

const PaginationItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={style}>{children}</View>
);

const PaginationLink = ({ 
  children, 
  onPress, 
  isActive, 
  style 
}: { 
  children: React.ReactNode; 
  onPress?: () => void;
  isActive?: boolean;
  style?: ViewStyle;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.link, isActive && styles.linkActive, style]}
  >
    <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{children}</Text>
  </TouchableOpacity>
);

const PaginationPrevious = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.navButton}>
    <Feather name="chevron-left" size={16} color="#0F172A" />
    <Text style={styles.navButtonText}>Previous</Text>
  </TouchableOpacity>
);

const PaginationNext = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.navButton}>
    <Text style={styles.navButtonText}>Next</Text>
    <Feather name="chevron-right" size={16} color="#0F172A" />
  </TouchableOpacity>
);

const PaginationEllipsis = () => (
  <View style={styles.ellipsis}>
    <Feather name="more-horizontal" size={16} color="#64748B" />
  </View>
);

const styles = StyleSheet.create({
  pagination: {
    marginVertical: 16,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  link: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  linkActive: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  linkText: {
    fontSize: 14,
    color: "#0F172A",
  },
  linkTextActive: {
    fontWeight: "600",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  navButtonText: {
    fontSize: 14,
    color: "#0F172A",
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
