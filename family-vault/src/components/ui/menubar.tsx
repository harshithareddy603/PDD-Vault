import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

const Menubar = ({ children }: { children: React.ReactNode }) => <View style={styles.menubar}>{children}</View>;
const MenubarMenu = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarTrigger = ({ children }: { children: React.ReactNode }) => <View style={styles.trigger}>{children}</View>;
const MenubarContent = ({ children }: { children: React.ReactNode }) => null;
const MenubarItem = ({ children }: { children: React.ReactNode }) => null;
const MenubarSeparator = () => null;
const MenubarLabel = ({ children }: { children: React.ReactNode }) => null;
const MenubarCheckboxItem = ({ children }: { children: React.ReactNode }) => null;
const MenubarRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarRadioItem = ({ children }: { children: React.ReactNode }) => null;
const MenubarPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarSubContent = ({ children }: { children: React.ReactNode }) => null;
const MenubarSubTrigger = ({ children }: { children: React.ReactNode }) => null;
const MenubarGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarShortcut = ({ children }: { children: React.ReactNode }) => null;

const styles = StyleSheet.create({
  menubar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
