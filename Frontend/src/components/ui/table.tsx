import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from "react-native";

const Table = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={[styles.table, style]}>{children}</View>
  </ScrollView>
);

const TableHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const TableBody = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.body, style]}>{children}</View>
);

const TableRow = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.row, style]}>{children}</View>
);

const TableHead = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <View style={styles.cellContainer}>
    <Text style={[styles.head, style]}>{children}</Text>
  </View>
);

const TableCell = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <View style={styles.cellContainer}>
    <Text style={[styles.cell, style]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  table: {
    width: "100%",
    minWidth: 400,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  body: {},
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
  },
  cellContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  head: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "left",
  },
  cell: {
    fontSize: 14,
    color: "#0f172a",
    textAlign: "left",
  },
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
