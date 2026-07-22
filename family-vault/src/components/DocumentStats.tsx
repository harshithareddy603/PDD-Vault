import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useMemo } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { useFamily } from "../hooks/useFamily";
import { BarChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export const DocumentStats = () => {
  const { documents } = useDocuments();
  const { members } = useFamily();

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    return {
      labels: labels.length > 0 ? labels : ["None"],
      datasets: [{ data: data.length > 0 ? data : [0] }]
    };
  }, [documents]);

  const ownerData = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      const ownerName = d.family_member_id
        ? members.find((m) => m.id === d.family_member_id)?.name ?? "Family"
        : "You";
      counts[ownerName] = (counts[ownerName] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    return {
      labels: labels.length > 0 ? labels : ["None"],
      datasets: [{ data: data.length > 0 ? data : [0] }]
    };
  }, [documents, members]);

  const timelineData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    // Initialize next 6 months for better mobile view
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months[label] = 0;
    }
    documents.forEach((d) => {
      if (d.expiry_date) {
        const exp = new Date(d.expiry_date);
        const diffMonths = (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
        if (diffMonths >= 0 && diffMonths < 6) {
          const label = exp.toLocaleString('default', { month: 'short' });
          if (months[label] !== undefined) months[label]++;
        }
      }
    });
    return {
      labels: Object.keys(months),
      datasets: [{ data: Object.values(months) }]
    };
  }, [documents]);

  if (documents.length === 0) return null;

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Documents by Category</Text>
        <BarChart
          data={categoryData}
          width={screenWidth - 64}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          style={styles.chart}
          fromZero
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Documents per Owner</Text>
        <BarChart
          data={ownerData}
          width={screenWidth - 64}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          }}
          verticalLabelRotation={30}
          style={styles.chart}
          fromZero
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expiry Timeline (Next 6 Months)</Text>
        <LineChart
          data={timelineData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
