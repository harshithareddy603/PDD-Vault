import * as React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Carousel = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  return (
    <View style={[styles.carousel, style]}>
      {children}
    </View>
  );
};

const CarouselContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  return (
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      style={[styles.content, style]}
    >
      {children}
    </ScrollView>
  );
};

const CarouselItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  return (
    <View style={[styles.item, style]}>
      {children}
    </View>
  );
};

const CarouselPrevious = () => null;
const CarouselNext = () => null;

const styles = StyleSheet.create({
  carousel: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
  },
  item: {
    width: SCREEN_WIDTH - 40, // Adjust based on padding
    marginRight: 10,
  },
});

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
