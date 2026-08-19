import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CardHeader = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const CardTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const CardDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const CardContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>{children}</View>
);

const CardFooter = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
    flexDirection: "row",
    alignItems: "center",
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
