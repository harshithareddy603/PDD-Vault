import * as React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}>({});

const Select = ({ children, value, onValueChange }: { 
  children: React.ReactNode; 
  value?: string; 
  onValueChange?: (value: string) => void 
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { setOpen } = React.useContext(SelectContext);
  return (
    <TouchableOpacity 
      style={[styles.trigger, style]} 
      onPress={() => setOpen?.(true)}
    >
      <View style={styles.triggerContent}>
        {children}
        <Feather name="chevron-down" size={16} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return (
    <Text style={[styles.value, !value && styles.placeholder]}>
      {value || placeholder}
    </Text>
  );
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = React.useContext(SelectContext);
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
        <View style={styles.modalContent}>
          <ScrollView>{children}</ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => {
  const { value: activeValue, onValueChange, setOpen } = React.useContext(SelectContext);
  const isActive = activeValue === value;

  return (
    <TouchableOpacity 
      style={[styles.item, isActive && styles.activeItem]}
      onPress={() => {
        onValueChange?.(value);
        setOpen?.(false);
      }}
    >
      <Text style={[styles.itemText, isActive && styles.activeItemText]}>
        {children}
      </Text>
      {isActive && <Feather name="check" size={16} color="#3b82f6" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trigger: {
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 14,
    color: "#0f172a",
  },
  placeholder: {
    color: "#94a3b8",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    width: "100%",
    maxHeight: "50%",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  activeItem: {
    backgroundColor: "#f8fafc",
  },
  itemText: {
    fontSize: 14,
    color: "#0f172a",
  },
  activeItemText: {
    fontWeight: "600",
    color: "#3b82f6",
  },
});

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
