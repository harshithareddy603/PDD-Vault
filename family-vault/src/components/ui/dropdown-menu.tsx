import * as React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const DropdownMenuContext = React.createContext<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
}>({});

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <TouchableOpacity onPress={() => setOpen?.(true)}>
      {children}
    </TouchableOpacity>
  );
};

const DropdownMenuContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpen?.(false)}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setOpen?.(false)}
      >
        <View style={[styles.content, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const DropdownMenuItem = ({ children, onPress, style }: { 
  children: React.ReactNode; 
  onPress?: () => void;
  style?: ViewStyle;
}) => {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <TouchableOpacity 
      style={[styles.item, style]} 
      onPress={() => {
        onPress?.();
        setOpen?.(false);
      }}
    >
      <View style={styles.itemContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const DropdownMenuLabel = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.label, style]}>{children}</Text>
);

const DropdownMenuSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 4,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 4,
  },
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
