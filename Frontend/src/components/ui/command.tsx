import * as React from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.command, style]}>{children}</View>
);

const CommandDialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ padding: 0 }}>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = ({ placeholder, style }: { placeholder?: string; style?: ViewStyle }) => (
  <View style={[styles.inputWrapper, style]}>
    <Feather name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      style={styles.input}
    />
  </View>
);

const CommandList = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <ScrollView style={[styles.list, style]}>{children}</ScrollView>
);

const CommandEmpty = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{children}</Text>
  </View>
);

const CommandGroup = ({ children, heading, style }: { children: React.ReactNode; heading?: string; style?: ViewStyle }) => (
  <View style={[styles.group, style]}>
    {heading && <Text style={styles.groupHeading}>{heading}</Text>}
    {children}
  </View>
);

const CommandItem = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);

const CommandSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  command: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  group: {
    padding: 4,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  item: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 14,
    color: "#0F172A",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: -4,
    marginVertical: 4,
  },
});

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
