import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<string, string> });
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = ({ 
  children, 
  config, 
  style 
}: { 
  children: React.ReactNode; 
  config: ChartConfig;
  style?: ViewStyle;
}) => (
  <ChartContext.Provider value={{ config }}>
    <View style={[styles.container, style]}>
      {children}
    </View>
  </ChartContext.Provider>
);

const ChartTooltip = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;

const ChartTooltipContent = ({ 
  label, 
  style 
}: { 
  label?: string; 
  style?: ViewStyle 
}) => (
  <View style={[styles.tooltip, style]}>
    <Text style={styles.tooltipLabel}>{label}</Text>
  </View>
);

const ChartLegend = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;

const ChartLegendContent = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.legend, style]} />
);

const ChartStyle = () => null;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1.77,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tooltip: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tooltipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
});

export { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent, 
  ChartStyle 
};
