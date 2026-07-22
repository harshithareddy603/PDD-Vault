import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

const ContextMenu = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuContent = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuItem = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuRadioItem = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuLabel = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuSeparator = () => null;
const ContextMenuShortcut = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuSubContent = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuSubTrigger = ({ children }: { children: React.ReactNode }) => null;
const ContextMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
