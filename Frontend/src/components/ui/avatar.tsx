import * as React from "react";
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle, TextStyle } from "react-native";

const Avatar = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.avatar, style]}>{children}</View>
);

const AvatarImage = ({ source, style }: { source: any; style?: ImageStyle }) => (
  <Image source={source} style={[styles.image, style]} />
);

const AvatarFallback = ({ children, style, textStyle }: { 
  children: React.ReactNode; 
  style?: ViewStyle; 
  textStyle?: TextStyle 
}) => (
  <View style={[styles.fallback, style]}>
    <Text style={[styles.fallbackText, textStyle]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    position: "relative",
    flexDirection: "row",
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: {
    height: "100%",
    width: "100%",
    aspectRatio: 1,
  },
  fallback: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
});

export { Avatar, AvatarImage, AvatarFallback };
