import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const isMobile = true;

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const contextValue = React.useMemo(() => ({
    state: (open ? "expanded" : "collapsed") as "expanded" | "collapsed",
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  }), [open, openMobile]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <View style={styles.provider}>{children}</View>
    </SidebarContext.Provider>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { openMobile, setOpenMobile } = useSidebar();
  if (!openMobile) return null;

  return (
    <View style={styles.sidebarOverlay}>
      <TouchableOpacity 
        style={styles.overlayClose} 
        onPress={() => setOpenMobile(false)} 
      />
      <View style={styles.sidebarContent}>
        <ScrollView>{children}</ScrollView>
      </View>
    </View>
  );
};

const SidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <TouchableOpacity onPress={toggleSidebar} style={styles.trigger}>
      <Feather name="menu" size={24} color="#0f172a" />
    </TouchableOpacity>
  );
};

const SidebarContent = ({ children }: { children: React.ReactNode }) => <View style={styles.content}>{children}</View>;
const SidebarHeader = ({ children }: { children: React.ReactNode }) => <View style={styles.header}>{children}</View>;
const SidebarFooter = ({ children }: { children: React.ReactNode }) => <View style={styles.footer}>{children}</View>;
const SidebarGroup = ({ children }: { children: React.ReactNode }) => <View style={styles.group}>{children}</View>;
const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => <Text style={styles.groupLabel}>{children}</Text>;
const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => <View style={styles.groupContent}>{children}</View>;
const SidebarMenu = ({ children }: { children: React.ReactNode }) => <View style={styles.menu}>{children}</View>;
const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => <View style={styles.menuItem}>{children}</View>;
const SidebarMenuButton = ({ children, isActive }: { children: React.ReactNode; isActive?: boolean }) => (
  <TouchableOpacity style={[styles.menuButton, isActive && styles.menuButtonActive]}>
    <View style={styles.menuButtonContent}>{children}</View>
  </TouchableOpacity>
);
const SidebarMenuAction = ({ children }: { children: React.ReactNode }) => <View style={styles.menuAction}>{children}</View>;
const SidebarMenuBadge = ({ children }: { children: React.ReactNode }) => <View style={styles.menuBadge}>{children}</View>;
const SidebarMenuSkeleton = () => null;
const SidebarMenuSub = ({ children }: { children: React.ReactNode }) => <View style={styles.menuSub}>{children}</View>;
const SidebarMenuSubItem = ({ children }: { children: React.ReactNode }) => <View style={styles.menuSubItem}>{children}</View>;
const SidebarMenuSubButton = ({ children, isActive }: { children: React.ReactNode; isActive?: boolean }) => (
  <TouchableOpacity style={[styles.menuSubButton, isActive && styles.menuSubButtonActive]}>
    <Text style={[styles.menuSubButtonText, isActive && styles.menuSubButtonTextActive]}>{children}</Text>
  </TouchableOpacity>
);
const SidebarRail = () => null;
const SidebarSeparator = () => <View style={styles.separator} />;
const SidebarInset = ({ children }: { children: React.ReactNode }) => <View style={styles.inset}>{children}</View>;
const SidebarInput = () => null;

const styles = StyleSheet.create({
  provider: { flex: 1, flexDirection: "row" },
  sidebarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, flexDirection: "row" },
  overlayClose: { flex: 1 },
  sidebarContent: { width: 280, backgroundColor: "#ffffff", height: "100%" },
  trigger: { padding: 8 },
  content: { flex: 1, padding: 12 },
  header: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 12, fontWeight: "600", color: "#64748b", paddingHorizontal: 8, marginBottom: 8, textTransform: "uppercase" },
  groupContent: { gap: 4 },
  menu: { gap: 4 },
  menuItem: {},
  menuButton: { padding: 8, borderRadius: 6 },
  menuButtonActive: { backgroundColor: "#f1f5f9" },
  menuButtonContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuAction: {},
  menuBadge: {},
  menuSub: { paddingLeft: 24, marginTop: 4, gap: 2 },
  menuSubItem: {},
  menuSubButton: { padding: 6, borderRadius: 4 },
  menuSubButtonActive: { backgroundColor: "#f8fafc" },
  menuSubButtonText: { fontSize: 14, color: "#64748b" },
  menuSubButtonTextActive: { color: "#0f172a", fontWeight: "500" },
  separator: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 },
  inset: { flex: 1 },
});

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
