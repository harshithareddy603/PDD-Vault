import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import React, { ReactNode, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// ─── Navigation config ──────────────────────────────────────────────────────

const WEB_NAV = [
  { key: 'Dashboard',     label: 'Dashboard', icon: 'home-outline'            as const, sub: false },
  { key: 'Documents',     label: 'Documents', icon: 'file-document-outline'   as const, sub: true  },
  { key: 'Search',        label: 'Search',    icon: 'magnify'                 as const, sub: false },
  { key: 'Notifications', label: 'Alerts',    icon: 'bell-outline'            as const, sub: false },
  { key: 'Family',        label: 'Family',    icon: 'account-group-outline'   as const, sub: false },
  { key: 'Analytics',     label: 'Analytics', icon: 'chart-bar'               as const, sub: false },
];

const FOOTER_NAV = [
  { key: 'Settings', label: 'Settings', icon: 'cog-outline'         as const },
  { key: 'Help',     label: 'Help',     icon: 'help-circle-outline'  as const },
];

const DOC_SUBS = [
  { label: 'IDs',           color: '#3B82F6' },
  { label: 'Certificates',  color: '#8B5CF6' },
  { label: 'Insurance',     color: '#F97316' },
  { label: 'Medical',       color: '#EF4444' },
  { label: 'Licenses',      color: '#06B6D4' },
  { label: 'Resumes',       color: '#6366F1' },
];

const MOBILE_NAV = [
  { to: 'Dashboard', label: 'Home',    icon: 'home-outline'          as const },
  { to: 'Documents', label: 'Docs',    icon: 'file-document-outline' as const },
  { to: 'Family',    label: 'Family',  icon: 'account-group-outline' as const },
  { to: 'Profile',   label: 'Profile', icon: 'account-outline'       as const },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [docsExpanded, setDocsExpanded] = useState(
    route.name === 'Documents',
  );

  const alertCount = documents.filter((d) => {
    if (!d.expiry_date) return false;
    const days = Math.floor(
      (new Date(d.expiry_date).getTime() - Date.now()) / 86_400_000,
    );
    return days >= 0 && days <= 60;
  }).length;

  const fullName =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'User';
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // ── Web sidebar layout ───────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={ws.root}>
        {/* ── Sidebar ── */}
        <View style={ws.sidebar}>
          {/* Logo */}
          <TouchableOpacity
            style={ws.logoRow}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={ws.logoBox}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={18}
                color="#fff"
              />
            </View>
            <Text style={ws.logoText}>SmartDocs</Text>
          </TouchableOpacity>

          {/* Nav items */}
          <ScrollView style={ws.navScroll} showsVerticalScrollIndicator={false}>
            {WEB_NAV.map((item) => {
              const isActive =
                route.name === item.key ||
                (item.key === 'Documents' && docsExpanded && route.name === 'Documents');
              return (
                <View key={item.key}>
                  <TouchableOpacity
                    style={[ws.navItem, isActive && ws.navItemActive]}
                    onPress={() => {
                      if (item.sub) {
                        setDocsExpanded((v) => !v);
                        navigation.navigate('Documents', { category: 'All' });
                      } else {
                        navigation.navigate(item.key);
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={17}
                      color={isActive ? '#3B82F6' : '#64748B'}
                    />
                    <Text
                      style={[ws.navLabel, isActive && ws.navLabelActive]}
                    >
                      {item.label}
                    </Text>
                    {item.sub && (
                      <MaterialCommunityIcons
                        name={docsExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#94A3B8"
                      />
                    )}
                  </TouchableOpacity>

                  {/* Document sub-items */}
                  {item.sub && docsExpanded && (
                    <View style={ws.subList}>
                      {DOC_SUBS.map((sub) => (
                        <TouchableOpacity
                          key={sub.label}
                          style={ws.subItem}
                          onPress={() => {
                            const mapping: Record<string, string> = {
                              IDs: 'ID',
                              Certificates: 'Certificate',
                              Insurance: 'Insurance',
                              Medical: 'Medical',
                              Licenses: 'License',
                              Resumes: 'Resume',
                            };
                            navigation.navigate('Documents', { category: mapping[sub.label] || 'All' });
                          }}
                        >
                          <Text style={[ws.subText, { color: sub.color }]}>
                            {sub.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer nav */}
          <View style={ws.sidebarFooter}>
            {FOOTER_NAV.map((item) => {
              const isActive = route.name === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[ws.navItem, isActive && ws.navItemActive]}
                  onPress={() => navigation.navigate(item.key)}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={17}
                    color={isActive ? '#3B82F6' : '#64748B'}
                  />
                  <Text
                    style={[ws.navLabel, isActive && ws.navLabelActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Main area ── */}
        <View style={ws.main}>
          {/* Top header */}
          <View style={ws.header}>
            <View style={{ flex: 1 }} />
            <View style={ws.headerRight}>
              {/* Search icon */}
              <TouchableOpacity
                style={ws.iconBtn}
                onPress={() => navigation.navigate('Search')}
              >
                <Feather name="search" size={17} color="#64748B" />
              </TouchableOpacity>

              {/* Bell icon */}
              <TouchableOpacity
                style={ws.iconBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Feather name="bell" size={17} color="#64748B" />
                {alertCount > 0 && (
                  <View style={ws.badge}>
                    <Text style={ws.badgeText}>
                      {alertCount > 9 ? '9+' : alertCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* User chip */}
              <TouchableOpacity
                style={ws.userChip}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={[ws.avatar, { overflow: 'hidden' }]}>
                  {user?.user_metadata?.avatar_url ? (
                    <Image
                      source={{ uri: user.user_metadata.avatar_url }}
                      style={{ width: 28, height: 28 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={ws.avatarText}>{initials}</Text>
                  )}
                </View>
                <Text style={ws.userName} numberOfLines={1}>
                  {fullName}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page content */}
          <ScrollView
            style={ws.scrollArea}
            contentContainerStyle={ws.pageContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── Mobile layout ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={ms.safe}>
      <View style={ms.wrapper}>
        {/* Mobile header */}
        <View style={ms.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            style={ms.logoRow}
          >
            <View style={ms.logoBox}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={18}
                color="#fff"
              />
            </View>
            <Text style={ms.logoText}>SmartDocs</Text>
          </TouchableOpacity>

          <View style={ms.headerRight}>
            <TouchableOpacity
              style={ms.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Feather name="bell" size={20} color="#374151" />
              {alertCount > 0 && <View style={ms.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={ms.iconBtn}
              onPress={async () => {
                await signOut();
                navigation.navigate('Auth');
              }}
            >
              <Feather name="log-out" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scroll area */}
        <ScrollView
          contentContainerStyle={ms.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={ms.contentInner}>{children}</View>
        </ScrollView>

        {/* Bottom tab bar */}
        <View style={ms.bottomBar}>
          {MOBILE_NAV.map((l) => {
            const active = route.name === l.to;
            return (
              <TouchableOpacity
                key={l.to}
                style={ms.tabItem}
                onPress={() => navigation.navigate(l.to)}
              >
                <View
                  style={[ms.tabIcon, active && ms.tabIconActive]}
                >
                  <MaterialCommunityIcons
                    name={l.icon}
                    size={20}
                    color={active ? '#3B82F6' : '#6B7280'}
                  />
                </View>
                <Text
                  style={[ms.tabLabel, active && ms.tabLabelActive]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Web styles ───────────────────────────────────────────────────────────────

const ws = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  sidebar: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    flexDirection: 'column',
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginBottom: 4,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  navScroll: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 10,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: '#EFF6FF' },
  navLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  navLabelActive: { color: '#3B82F6', fontWeight: '600' },
  subList: { paddingLeft: 36, paddingBottom: 6 },
  subItem: { paddingVertical: 5, paddingHorizontal: 8 },
  subText: { fontSize: 12.5, fontWeight: '500' },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  main: { flex: 1, flexDirection: 'column' },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  badgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    gap: 8,
    marginLeft: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    maxWidth: 120,
  },
  scrollArea: { flex: 1, backgroundColor: '#F8FAFC' },
  pageContent: { padding: 32, paddingBottom: 60 },
});

// ─── Mobile styles ────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  wrapper: { flex: 1, position: 'relative' },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollContent: { flexGrow: 1, paddingBottom: 90 },
  contentInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 72,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: { backgroundColor: 'rgba(59,130,246,0.1)' },
  tabLabel: { fontSize: 11, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  tabLabelActive: { color: '#3B82F6' },
});
