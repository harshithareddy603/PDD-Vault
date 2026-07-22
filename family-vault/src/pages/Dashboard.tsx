import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { DocumentPreviewSheet } from '../components/DocumentPreviewSheet';
import type { DocumentRow } from '../services/supabase';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { useFamily } from '../hooks/useFamily';
import { DocumentLogo } from '../components/DocumentLogo';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// ─── helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { bg: string; text: string }> = {
  ID:          { bg: '#DBEAFE', text: '#1D4ED8' },
  License:     { bg: '#FEF3C7', text: '#D97706' },
  Insurance:   { bg: '#FEE2E2', text: '#DC2626' },
  Certificate: { bg: '#EDE9FE', text: '#7C3AED' },
  Medical:     { bg: '#FCE7F3', text: '#BE185D' },
  Education:   { bg: '#D1FAE5', text: '#059669' },
  Other:       { bg: '#F1F5F9', text: '#475569' },
};

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  safe:    { bg: '#D1FAE5', text: '#059669', label: 'Active'   },
  soon:    { bg: '#FEF3C7', text: '#D97706', label: 'Expiring' },
  expired: { bg: '#FEE2E2', text: '#DC2626', label: 'Expired'  },
};

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META.Other;
}

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.safe;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ label, value, iconName, iconBg, iconColor }: StatCardProps) => (
  <View style={sc.card}>
    <View style={[sc.iconWrap, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={iconName as any} size={22} color={iconColor} />
    </View>
    <Text style={sc.value}>{value}</Text>
    <Text style={sc.label}>{label}</Text>
  </View>
);

const sc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const { documents, loading } = useDocuments();
  const { members } = useFamily();
  const navigation = useNavigation<any>();
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  const name = (user?.user_metadata?.name as string | undefined) || 'User';

  // Stats
  const totalDocs = documents.length;
  const expiringSoon = documents.filter((d) => d.status === 'soon').length;
  const expired = documents.filter((d) => d.status === 'expired').length;
  const familyCount = members.length;

  // Recent docs (last 5)
  const recentDocs = useMemo(
    () =>
      [...documents]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [documents],
  );

  // Recent alerts (non-safe, last 3)
  const recentAlerts = useMemo(
    () => documents.filter((d) => d.status !== 'safe').slice(0, 3),
    [documents],
  );

  const isWeb = Platform.OS === 'web';

  return (
    <AppLayout>
      {/* Welcome header */}
      <View style={s.welcome}>
        <Text style={s.welcomeTitle}>Welcome back, {name}!</Text>
        <Text style={s.welcomeSub}>
          Smart Doc's happening with your documents
        </Text>
      </View>

      {/* Stat cards row */}
      <View style={s.statsRow}>
        <StatCard
          label="Total Documents"
          value={totalDocs}
          iconName="file-document-outline"
          iconBg="#DBEAFE"
          iconColor="#3B82F6"
        />
        <StatCard
          label="Expiring Soon"
          value={expiringSoon}
          iconName="clock-alert-outline"
          iconBg="#FFEDD5"
          iconColor="#F97316"
        />
        <StatCard
          label="Expired"
          value={expired}
          iconName="alert-circle-outline"
          iconBg="#FEE2E2"
          iconColor="#EF4444"
        />
        <StatCard
          label="Family Members"
          value={familyCount}
          iconName="account-group-outline"
          iconBg="#D1FAE5"
          iconColor="#10B981"
        />
      </View>

      {/* Middle section: Storage + Quick Actions + Recent Alerts */}
      <View style={[s.midRow, isWeb && s.midRowWide]}>
        {/* Storage Usage */}
        <View style={[s.midCard, { flex: isWeb ? 1.1 : undefined }]}>
          <View style={s.cardHeaderRow}>
            <MaterialCommunityIcons name="database-outline" size={16} color="#64748B" />
            <Text style={s.cardTitle}>Storage Usage</Text>
          </View>
          <Text style={s.storageNum}>
            <Text style={{ color: '#3B82F6', fontWeight: '700' }}>
              {(totalDocs * 0.035).toFixed(1)} GB
            </Text>
            {' / 10 GB'}
          </Text>
          <View style={s.progressBg}>
            <View
              style={[
                s.progressBar,
                { width: `${Math.min(totalDocs * 0.35, 100)}%` as any },
              ]}
            />
          </View>
          <Text style={s.storageSub}>Storage Usage</Text>
        </View>

        {/* Quick Actions */}
        <View style={[s.midCard, { flex: isWeb ? 1.4 : undefined }]}>
          <Text style={s.cardTitle}>Quick Actions</Text>
          {[
            {
              label: 'Upload Document',
              icon: 'upload-outline',
              color: '#10B981',
              bg: '#D1FAE5',
              screen: 'Documents',
            },
            {
              label: 'Scan Document',
              icon: 'scan-helper',
              color: '#3B82F6',
              bg: '#DBEAFE',
              screen: 'Documents',
            },
            {
              label: 'Search Documents',
              icon: 'magnify',
              color: '#8B5CF6',
              bg: '#EDE9FE',
              screen: 'Search',
            },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={s.actionRow}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[s.actionIcon, { backgroundColor: action.bg }]}>
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={16}
                  color={action.color}
                />
              </View>
              <Text style={s.actionLabel}>{action.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Alerts */}
        <View style={[s.midCard, { flex: isWeb ? 1.5 : undefined }]}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Recent Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={s.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentAlerts.length === 0 ? (
            <Text style={s.emptySmall}>No active alerts</Text>
          ) : (
            recentAlerts.map((d) => {
              const isExpired = d.status === 'expired';
              const days = d.expiry_date
                ? Math.floor(
                    (new Date(d.expiry_date).getTime() - Date.now()) / 86_400_000,
                  )
                : null;
              return (
                <View key={d.id} style={s.alertItem}>
                  <MaterialCommunityIcons
                    name={isExpired ? 'alert-circle' : 'clock-outline'}
                    size={14}
                    color={isExpired ? '#EF4444' : '#F97316'}
                    style={{ marginTop: 2 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.alertText} numberOfLines={1}>
                      {isExpired
                        ? `${d.name} has expired`
                        : `${d.name} will expire in ${days} days`}
                    </Text>
                    <Text style={s.alertDate}>{formatDate(d.expiry_date)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Recent Documents table */}
      <View style={s.tableCard}>
        <View style={s.tableHeader}>
          <Text style={s.cardTitle}>Recent Documents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Documents')}>
            <Text style={s.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginVertical: 24 }} />
        ) : recentDocs.length === 0 ? (
          <View style={s.emptyTable}>
            <Text style={s.emptyText}>No documents yet.</Text>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => navigation.navigate('Documents')}
            >
              <Text style={s.addBtnText}>Add Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Table head (web only) */}
            {isWeb && (
              <View style={[s.tableRow, s.tableHead]}>
                <Text style={[s.thCell, { flex: 2.5 }]}>DOCUMENT</Text>
                <Text style={[s.thCell, { flex: 1.2 }]}>CATEGORY</Text>
                <Text style={[s.thCell, { flex: 1.2 }]}>STATUS</Text>
                <Text style={[s.thCell, { flex: 1.5 }]}>UPLOAD DATE</Text>
                <Text style={[s.thCell, { flex: 0.8, textAlign: 'right' }]}>ACTIONS</Text>
              </View>
            )}

            {recentDocs.map((d, i) => {
              const cat = getCategoryMeta(d.category);
              const stat = getStatusMeta(d.status);
              return (
                <View
                  key={d.id}
                  style={[
                    s.tableRow,
                    i < recentDocs.length - 1 && s.tableRowBorder,
                  ]}
                >
                  {/* Document name */}
                  <View style={[s.tdName, { flex: isWeb ? 2.5 : 3 }]}>
                    <View style={s.docLogoWrap}>
                      <DocumentLogo
                        name={d.name}
                        category={d.category}
                        source={d.source}
                        size={20}
                      />
                    </View>
                    <Text style={s.docName} numberOfLines={1}>
                      {d.name}
                    </Text>
                  </View>

                  {/* Category badge */}
                  <View style={[s.tdCell, { flex: isWeb ? 1.2 : undefined }]}>
                    <View
                      style={[s.badge, { backgroundColor: cat.bg }]}
                    >
                      <Text style={[s.badgeText, { color: cat.text }]}>
                        {d.category}
                      </Text>
                    </View>
                  </View>

                  {/* Status badge */}
                  <View style={[s.tdCell, { flex: isWeb ? 1.2 : undefined }]}>
                    <View
                      style={[s.badge, { backgroundColor: stat.bg }]}
                    >
                      <Text style={[s.badgeText, { color: stat.text }]}>
                        {stat.label}
                      </Text>
                    </View>
                  </View>

                  {/* Date (web only) */}
                  {isWeb && (
                    <View style={[s.tdCell, { flex: 1.5 }]}>
                      <Text style={s.dateText}>{formatDate(d.created_at)}</Text>
                    </View>
                  )}

                  {/* Action */}
                  <View style={[s.tdCell, { flex: isWeb ? 0.8 : undefined, alignItems: 'flex-end' }]}>
                    <TouchableOpacity
                      style={s.viewBtn}
                      onPress={() => setPreviewDoc(d)}
                    >
                      <Text style={s.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <DocumentPreviewSheet
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </AppLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  welcome: { marginBottom: 24 },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  welcomeSub: { fontSize: 13, color: '#64748B' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },

  // Middle row
  midRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  midRowWide: { flexDirection: 'row', alignItems: 'flex-start' },
  midCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAll: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },

  // Storage
  storageNum: { fontSize: 13, color: '#1E293B', marginBottom: 8 },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  storageSub: { fontSize: 11, color: '#94A3B8' },

  // Quick actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500' },

  // Alert items
  alertItem: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  alertText: { fontSize: 12.5, color: '#1E293B', fontWeight: '500' },
  alertDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  emptySmall: { fontSize: 12, color: '#94A3B8', marginTop: 8 },

  // Table card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHead: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tdName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docLogoWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docName: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  tdCell: { paddingRight: 8 },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11.5, fontWeight: '600' },
  dateText: { fontSize: 12.5, color: '#64748B' },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewBtnText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },

  // Empty states
  emptyTable: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: { fontSize: 13, color: '#64748B' },
  addBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});

export default Dashboard;
