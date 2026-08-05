/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDocuments } from '../hooks/useDocuments';

import { useTheme } from '../context/ThemeContext';

// ─── Stat Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  isFeather?: boolean;
}

const StatCard = ({
  label,
  value,
  subtext,
  iconName,
  iconBg,
  iconColor,
  isFeather = false,
}: StatCardProps) => {
  const { colors } = useTheme();
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.cardHeader}>
        <View style={[s.iconBox, { backgroundColor: iconBg }]}>
          {isFeather ? (
            <Feather name={iconName as any} size={18} color={iconColor} />
          ) : (
            <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
          )}
        </View>
      </View>
      <Text style={[s.cardLabel, { color: colors.subtext }]}>{label}</Text>
      <Text style={[s.cardValue, { color: colors.text }]}>{value}</Text>
      <Text style={s.cardSubtext}>{subtext}</Text>
    </View>
  );
};

// ─── Main Analytics Page ─────────────────────────────────────────────────────

const Analytics = () => {
  const { documents } = useDocuments();
  const { colors, isDark } = useTheme();

  const docCount = documents.length;

  // Real Growth Rate Calculation based on created_at date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonth = lastMonthDate.getMonth();

  let thisMonthCount = 0;
  let lastMonthCount = 0;

  documents.forEach((d) => {
    if (!d.created_at) return;
    const dDate = new Date(d.created_at);
    if (dDate.getFullYear() === currentYear && dDate.getMonth() === currentMonth) {
      thisMonthCount++;
    } else if (dDate.getFullYear() === lastMonthYear && dDate.getMonth() === lastMonth) {
      lastMonthCount++;
    }
  });

  let growthRateText = "0%";
  let growthSubtext = "vs last month";

  if (lastMonthCount === 0) {
    if (thisMonthCount > 0) {
      growthRateText = "+100%";
      growthSubtext = `${thisMonthCount} new upload${thisMonthCount !== 1 ? 's' : ''} this month`;
    } else if (docCount > 0) {
      growthRateText = "0%";
      growthSubtext = "No new uploads this month";
    } else {
      growthRateText = "0%";
      growthSubtext = "No documents uploaded";
    }
  } else {
    const percentChange = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
    growthRateText = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
    growthSubtext = `${thisMonthCount} this month vs ${lastMonthCount} last month`;
  }

  // Active categories count
  const activeCategories = new Set(documents.map((d) => d.category)).size;
  const activeDocsCount = documents.filter((d) => d.status === 'safe').length;

  // Category breakdown calculation
  const categoryCounts: Record<string, number> = {};
  documents.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={[s.pageTitle, { color: colors.text }]}>Usage Analytics</Text>
        <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 4 }}>
          Live insights on uploads, document health, and category distribution
        </Text>
      </View>

      {/* Grid of stats */}
      <View style={s.statsGrid}>
        <StatCard
          label="Total Uploads"
          value={docCount}
          subtext={docCount > 0 ? `${activeDocsCount} active documents` : "No uploads yet"}
          iconName="upload"
          iconBg={isDark ? '#1e3a8a' : '#EFF6FF'}
          iconColor="#3B82F6"
          isFeather
        />
        <StatCard
          label="Active Documents"
          value={activeDocsCount}
          subtext={docCount > 0 ? `${Math.round((activeDocsCount / docCount) * 100)}% in safe status` : "No active documents"}
          iconName="shield-check"
          iconBg={isDark ? '#063022' : '#ECFDF5'}
          iconColor="#10B981"
        />
        <StatCard
          label="Active Categories"
          value={activeCategories}
          subtext={activeCategories > 0 ? `${activeCategories} distinct category types` : "No categories yet"}
          iconName="chart-bar"
          iconBg={isDark ? '#2e1065' : '#F5F3FF'}
          iconColor="#8B5CF6"
        />
        <StatCard
          label="Monthly Growth"
          value={growthRateText}
          subtext={growthSubtext}
          iconName="trending-up"
          iconBg={isDark ? '#332010' : '#FFF7ED'}
          iconColor="#F97316"
          isFeather
        />
      </View>

      {/* Category Breakdown Card */}
      <View style={[s.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.chartTitle, { color: colors.text }]}>Category Distribution</Text>

        {sortedCategories.length === 0 ? (
          <Text style={{ fontSize: 13, color: colors.subtext, marginVertical: 12 }}>
            No document data available to display distribution.
          </Text>
        ) : (
          <View style={{ gap: 16 }}>
            {sortedCategories.map(([cat, count]) => {
              const pct = Math.round((count / docCount) * 100);
              return (
                <View key={cat} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.text }}>{cat}</Text>
                    <Text style={{ fontSize: 12.5, fontWeight: '500', color: colors.subtext }}>
                      {count} doc{count !== 1 ? 's' : ''} ({pct}%)
                    </Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' }}>
                    <View style={{ height: 8, borderRadius: 4, backgroundColor: '#3B82F6', width: `${pct}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </AppLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 200 : '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
  },
  chartWrapper: {
    height: 240,
    paddingTop: 10,
  },
  chartBody: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 30, // leave space for labels
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    zIndex: 2,
  },
  barColumn: {
    alignItems: 'center',
    width: '12%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    maxWidth: 24,
    borderRadius: 4,
  },
  barValue: {
    position: 'absolute',
    top: -20,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 10,
    height: 20,
  },
});

export default Analytics;
