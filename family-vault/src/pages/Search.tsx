import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentPreviewSheet } from '../components/DocumentPreviewSheet';
import type { DocumentRow } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DocumentLogo } from '../components/DocumentLogo';
import { useTheme } from '../context/ThemeContext';

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All Categories',
  'ID',
  'Certificate',
  'Insurance',
  'Medical',
  'License',
  'Education',
  'Other',
];

const STATUSES = ['All Status', 'Active', 'Expiring', 'Expired'];

const STATUS_MAP: Record<string, string> = {
  Active:   'safe',
  Expiring: 'soon',
  Expired:  'expired',
};

const CAT_META: Record<string, { bg: string; text: string }> = {
  ID:          { bg: '#DBEAFE', text: '#1D4ED8' },
  License:     { bg: '#FEF3C7', text: '#D97706' },
  Insurance:   { bg: '#FEE2E2', text: '#DC2626' },
  Certificate: { bg: '#EDE9FE', text: '#7C3AED' },
  Medical:     { bg: '#FCE7F3', text: '#BE185D' },
  Education:   { bg: '#D1FAE5', text: '#059669' },
  Other:       { bg: '#F1F5F9', text: '#475569' },
};

const STAT_META: Record<string, { bg: string; text: string; label: string }> = {
  safe:    { bg: '#D1FAE5', text: '#059669', label: 'Active'   },
  soon:    { bg: '#FEF3C7', text: '#D97706', label: 'Expiring' },
  expired: { bg: '#FEE2E2', text: '#DC2626', label: 'Expired'  },
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ─── Custom Dropdown ──────────────────────────────────────────────────────────

const Dropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={{ zIndex: open ? 50 : 1, position: 'relative' }}>
      <Text style={[dp.label, { color: colors.subtext }]}>{label}</Text>
      <TouchableOpacity
        style={[dp.trigger, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <Feather name="filter" size={13} color={colors.subtext} style={{ marginRight: 6 }} />
        <Text style={[dp.triggerText, { color: colors.text }]}>{value}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.subtext}
        />
      </TouchableOpacity>
      {open && (
        <View style={[dp.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                dp.menuItem,
                { borderBottomColor: colors.border },
                value === opt && { backgroundColor: colors.primaryBg },
              ]}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <Text style={[dp.menuText, { color: colors.text }, value === opt && { color: colors.primary, fontWeight: '600' }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const dp = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: { flex: 1, fontSize: 13.5 },
  menu: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  menuText: { fontSize: 13.5 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Search = () => {
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus]     = useState('All Status');
  const [searched, setSearched] = useState(false);
  const [results, setResults]   = useState<DocumentRow[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);

  const isWeb = Platform.OS === 'web';

  const handleSearch = () => {
    let filtered = [...documents];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'All Categories') {
      filtered = filtered.filter((d) => d.category === category);
    }

    if (status !== 'All Status') {
      const mapped = STATUS_MAP[status];
      if (mapped) filtered = filtered.filter((d) => d.status === mapped);
    }

    setResults(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setQuery('');
    setCategory('All Categories');
    setStatus('All Status');
    setSearched(false);
    setResults([]);
  };

  return (
    <AppLayout>
      {/* Title */}
      <Text style={[s.pageTitle, { color: colors.text }]}>Advanced Search</Text>

      {/* Filter card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Search term */}
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: colors.subtext }]}>Search Term</Text>
          <View style={[s.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="search" size={14} color={colors.subtext} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: colors.text }]}
              placeholder="Search documents by name..."
              placeholderTextColor={colors.mutedText}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        {/* Category + Status row */}
        <View style={[s.row2, isWeb && s.row2Wide]}>
          <View style={s.halfCol}>
            <Dropdown
              label="Category"
              options={CATEGORIES}
              value={category}
              onChange={setCategory}
            />
          </View>
          <View style={s.halfCol}>
            <Dropdown
              label="Status"
              options={STATUSES}
              value={status}
              onChange={setStatus}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={s.buttonRow}>
          <TouchableOpacity
            style={[s.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Text style={[s.resetBtnText, { color: colors.text }]}>Reset Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={s.searchBtnText}>Search Documents</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {searched && (
        <View style={[s.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.resultsTitle, { color: colors.text }]}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </Text>

          {results.length === 0 ? (
            <View style={s.emptyWrap}>
              <MaterialCommunityIcons
                name="file-search-outline"
                size={40}
                color={colors.subtext}
              />
              <Text style={[s.emptyText, { color: colors.subtext }]}>No documents match your filters.</Text>
            </View>
          ) : (
            <View>
              {/* Table header (web) */}
              {isWeb && (
                <View style={[s.tableRow, s.tableHead, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                  <Text style={[s.th, { flex: 2.5, color: colors.subtext }]}>DOCUMENT</Text>
                  <Text style={[s.th, { flex: 1.2, color: colors.subtext }]}>CATEGORY</Text>
                  <Text style={[s.th, { flex: 1.2, color: colors.subtext }]}>STATUS</Text>
                  <Text style={[s.th, { flex: 1.5, color: colors.subtext }]}>UPLOAD DATE</Text>
                  <Text style={[s.th, { flex: 0.8, textAlign: 'right', color: colors.subtext }]}>
                    ACTIONS
                  </Text>
                </View>
              )}
              {results.map((d, i) => {
                const cat = CAT_META[d.category] ?? CAT_META.Other;
                const stat = STAT_META[d.status] ?? STAT_META.safe;
                return (
                  <View
                    key={d.id}
                    style={[
                      s.tableRow,
                      i < results.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[s.tdName, { flex: isWeb ? 2.5 : 3 }]}>
                      <View style={[s.logoWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <DocumentLogo
                          name={d.name}
                          category={d.category}
                          source={d.source}
                          size={18}
                        />
                      </View>
                      <Text style={[s.docName, { color: colors.text }]} numberOfLines={1}>
                        {d.name}
                      </Text>
                    </View>
                    <View style={{ flex: isWeb ? 1.2 : undefined }}>
                      <View style={[s.pill, { backgroundColor: isDark ? colors.surface : cat.bg }]}>
                        <Text style={[s.pillText, { color: isDark ? colors.text : cat.text }]}>
                          {d.category}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: isWeb ? 1.2 : undefined }}>
                      <View style={[s.pill, { backgroundColor: isDark ? colors.surface : stat.bg }]}>
                        <Text style={[s.pillText, { color: isDark ? colors.text : stat.text }]}>
                          {stat.label}
                        </Text>
                      </View>
                    </View>
                    {isWeb && (
                      <View style={{ flex: 1.5 }}>
                        <Text style={[s.dateText, { color: colors.subtext }]}>{formatDate(d.created_at)}</Text>
                      </View>
                    )}
                    <View
                      style={{
                        flex: isWeb ? 0.8 : undefined,
                        alignItems: 'flex-end',
                      }}
                    >
                      <TouchableOpacity
                        style={[s.viewBtn, { borderColor: colors.border }]}
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
      )}

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
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 40,
    fontSize: 13.5,
    color: '#1E293B',
    outlineWidth: 0,
  } as any,
  row2: { gap: 12 },
  row2Wide: { flexDirection: 'row' },
  halfCol: { flex: 1 },
  checkRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    minWidth: 120,
  },
  resetBtnText: { fontSize: 13.5, fontWeight: '600', color: '#475569' },
  searchBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    minWidth: 120,
  },
  searchBtnText: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF' },

  // Results
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHead: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  th: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tdName: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docName: { fontSize: 13.5, fontWeight: '500', color: '#1E293B', flex: 1 },
  pill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11.5, fontWeight: '600' },
  dateText: { fontSize: 12.5, color: '#64748B' },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewBtnText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 13, color: '#94A3B8' },
});

export default Search;
