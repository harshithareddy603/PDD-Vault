/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeMode } from '../context/ThemeContext';

// ─── Custom Select Dropdown ──────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const SettingsDropdown = ({ label, options, value, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[dp.container, { zIndex: open ? 50 : 1 }]}>
      <Text style={[dp.label, { color: colors.subtext }]}>{label}</Text>
      <TouchableOpacity
        style={[dp.trigger, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={[dp.triggerText, { color: colors.text }]}>{value}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
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
              <Text
                style={[
                  dp.menuText,
                  { color: colors.text },
                  value === opt && { color: colors.primary, fontWeight: '600' },
                ]}
              >
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
  container: {
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  triggerText: {
    fontSize: 13.5,
  },
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
    zIndex: 100,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 13.5,
  },
});

// ─── Custom Checkbox ──────────────────────────────────────────────────────────

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const SettingsCheckbox = ({ label, value, onChange }: CheckboxProps) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={ck.row}
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
    >
      <View style={[ck.box, { borderColor: colors.border, backgroundColor: colors.inputBg }, value && ck.boxChecked]}>
        {value && <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />}
      </View>
      <Text style={[ck.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const ck = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  box: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  label: {
    fontSize: 13.5,
    fontWeight: '500',
  },
});

// ─── Main Settings Screen ──────────────────────────────────────────────────────

const Settings = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();
  const { mode, setMode, colors, isDark } = useTheme();

  // App Preferences Form States
  const [lang, setLang] = useState('English');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [tz, setTz] = useState('Pacific Standard Time (PST)');

  // Display Options States
  const [previews, setPreviews] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (Platform.OS === 'web') {
        alert('Settings saved successfully!');
      } else {
        Alert.alert('Success', 'Settings saved successfully!');
      }
    }, 800);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Auth');
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      if (Platform.OS === 'web') {
        alert('Logout failed: ' + msg);
      } else {
        Alert.alert('Error', 'Logout failed: ' + msg);
      }
    }
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
    { mode: 'light', label: 'Light Mode', icon: 'sun', desc: 'Clean & bright appearance' },
    { mode: 'dark', label: 'Dark Mode', icon: 'moon', desc: 'Sleek & eye-friendly' },
    { mode: 'system', label: 'System Default', icon: 'monitor', desc: 'Sync with your device' },
  ];

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={[s.pageTitle, { color: colors.text }]}>General Settings</Text>
        <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 4 }}>
          Customize your experience, appearance, and workspace preferences
        </Text>
      </View>

      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* App Preferences */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Appearance & Theme</Text>

        {/* Visual Theme Selection Cards */}
        <View style={s.themeCardsRow}>
          {themeOptions.map((opt) => {
            const selected = mode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  s.themeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                  selected && s.themeCardActive,
                ]}
                onPress={() => setMode(opt.mode)}
                activeOpacity={0.8}
              >
                <View style={s.themeCardHeader}>
                  <View
                    style={[
                      s.themeIconWrap,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : isDark
                          ? '#1e293b'
                          : '#e2e8f0',
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon as any}
                      size={18}
                      color={selected ? '#FFFFFF' : colors.subtext}
                    />
                  </View>
                  {selected && (
                    <View style={s.activeBadge}>
                      <Feather name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={[s.themeCardLabel, { color: colors.text }]}>{opt.label}</Text>
                <Text style={[s.themeCardDesc, { color: colors.subtext }]}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SettingsDropdown
          label="App Theme Mode"
          options={['System Default', 'Light Mode', 'Dark Mode']}
          value={mode === 'system' ? 'System Default' : mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
          onChange={(val) => {
            if (val === 'Dark Mode') setMode('dark');
            else if (val === 'Light Mode') setMode('light');
            else setMode('system');
          }}
        />

        <SettingsDropdown
          label="Language"
          options={['English', 'Spanish', 'French', 'German', 'Telugu', 'Hindi']}
          value={lang}
          onChange={setLang}
        />

        <SettingsDropdown
          label="Date Format"
          options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
          value={dateFormat}
          onChange={setDateFormat}
        />

        <SettingsDropdown
          label="Time Zone"
          options={[
            'Pacific Standard Time (PST)',
            'Eastern Standard Time (EST)',
            'Greenwich Mean Time (GMT)',
            'Indian Standard Time (IST)',
          ]}
          value={tz}
          onChange={setTz}
        />

        {/* Separator */}
        <View style={[s.separator, { backgroundColor: colors.border }]} />

        {/* Display Options */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Display Options</Text>
        <View style={s.checkList}>
          <SettingsCheckbox
            label="Show document previews"
            value={previews}
            onChange={setPreviews}
          />
          <SettingsCheckbox
            label="Enable animations"
            value={animations}
            onChange={setAnimations}
          />
          <SettingsCheckbox
            label="Compact view mode"
            value={compactMode}
            onChange={setCompactMode}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          {saving ? (
            <Text style={s.saveBtnText}>Saving...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFFFFF" />
              <Text style={s.saveBtnText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Separator */}
        <View style={[s.separator, { backgroundColor: colors.border }]} />

        {/* Account Options */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Account & Security</Text>
        
        <TouchableOpacity
          style={[
            s.logoutBtn,
            {
              backgroundColor: isDark ? '#3b1212' : '#FEF2F2',
              borderColor: isDark ? '#7f1d1d' : '#FEE2E2',
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={16} color="#EF4444" />
          <Text style={s.logoutBtnText}>Logout Session</Text>
        </TouchableOpacity>
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
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'none',
  },
  themeCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  themeCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
  },
  themeCardActive: {
    borderWidth: 2,
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  themeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCardLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeCardDesc: {
    fontSize: 11.5,
  },
  separator: {
    height: 1,
    marginVertical: 20,
  },
  checkList: {
    gap: 8,
    marginBottom: 24,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '600',
  },
});

export default Settings;

