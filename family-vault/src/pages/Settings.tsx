/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

// ─── Custom Select Dropdown ──────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const SettingsDropdown = ({ label, options, value, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={[dp.container, { zIndex: open ? 50 : 1 }]}>
      <Text style={dp.label}>{label}</Text>
      <TouchableOpacity style={dp.trigger} onPress={() => setOpen((v) => !v)} activeOpacity={0.7}>
        <Text style={dp.triggerText}>{value}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#64748B"
        />
      </TouchableOpacity>
      {open && (
        <View style={dp.menu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[dp.menuItem, value === opt && dp.menuItemActive]}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <Text style={[dp.menuText, value === opt && dp.menuTextActive]}>
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
    color: '#374151',
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
  },
  triggerText: {
    fontSize: 13.5,
    color: '#0F172A',
  },
  menu: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuText: {
    fontSize: 13.5,
    color: '#374151',
  },
  menuTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

// ─── Custom Checkbox ──────────────────────────────────────────────────────────

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const SettingsCheckbox = ({ label, value, onChange }: CheckboxProps) => (
  <TouchableOpacity
    style={ck.row}
    onPress={() => onChange(!value)}
    activeOpacity={0.7}
  >
    <View style={[ck.box, value && ck.boxChecked]}>
      {value && <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />}
    </View>
    <Text style={ck.label}>{label}</Text>
  </TouchableOpacity>
);

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
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  boxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  label: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
});

// ─── Main Settings Screen ──────────────────────────────────────────────────────

const Settings = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();

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

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.pageTitle}>General Settings</Text>
      </View>

      <View style={s.card}>
        {/* App Preferences */}
        <Text style={s.sectionTitle}>App Preferences</Text>

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
        <View style={s.separator} />

        {/* Display Options */}
        <Text style={s.sectionTitle}>Display Options</Text>
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
        <View style={s.separator} />

        {/* Account Options */}
        <Text style={s.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
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
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
    marginBottom: 16,
    textTransform: 'none',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
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
