import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
  useWindowDimensions,
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
  { to: 'Dashboard',     label: 'Home',    icon: 'home-outline'          as const },
  { to: 'Documents',     label: 'Docs',    icon: 'file-document-outline' as const },
  { to: 'Search',        label: 'Search',  icon: 'magnify'               as const },
  { to: 'Family',        label: 'Family',  icon: 'account-group-outline' as const },
  { to: 'Menu',          label: 'More',    icon: 'menu'                  as const },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const AppLayout = ({ children, scrollable = true }: { children: ReactNode; scrollable?: boolean }) => {
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
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
  if (Platform.OS === 'web' && width >= 768) {
    return (
      <View style={[ws.root, { minHeight: '100vh' as any }]}>
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
    <SafeAreaView style={[ms.safe, Platform.OS === 'web' && { minHeight: '100vh' as any }]}>
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
        {scrollable ? (
          <ScrollView
            contentContainerStyle={ms.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={ms.contentInner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[ms.contentInner, { flex: 1, height: '100%' }]}>{children}</View>
        )}

        {/* Bottom tab bar */}
        <View style={ms.bottomBar}>
          {MOBILE_NAV.map((l) => {
            const active = l.to === 'Menu' ? menuOpen : route.name === l.to;
            return (
              <TouchableOpacity
                key={l.to}
                style={ms.tabItem}
                onPress={() => {
                  if (l.to === 'Menu') {
                    setMenuOpen(!menuOpen);
                  } else {
                    setMenuOpen(false);
                    navigation.navigate(l.to);
                  }
                }}
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

        {/* Slide-up Menu Drawer */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <TouchableOpacity 
              style={ms.drawerBackdrop} 
              activeOpacity={1} 
              onPress={() => setMenuOpen(false)}
            />
            {/* Drawer Content */}
            <View style={ms.drawerContent}>
              <View style={ms.drawerHeader}>
                <View style={ms.drawerUserRow}>
                  <View style={ms.drawerAvatar}>
                    {user?.user_metadata?.avatar_url ? (
                      <Image source={{ uri: user.user_metadata.avatar_url }} style={ms.drawerAvatarImg} />
                    ) : (
                      <Text style={ms.drawerAvatarText}>{initials}</Text>
                    )}
                  </View>
                  <View style={ms.drawerUserInfo}>
                    <Text style={ms.drawerUserName}>{fullName}</Text>
                    <Text style={ms.drawerUserEmail}>{user?.email}</Text>
                  </View>
                </View>
              </View>

              <View style={ms.drawerGrid}>
                {[
                  { to: 'Notifications', label: 'Alerts', icon: 'bell-outline', color: '#F97316', bg: '#FFEDD5' },
                  { to: 'Analytics', label: 'Analytics', icon: 'chart-bar', color: '#10B981', bg: '#D1FAE5' },
                  { to: 'Settings', label: 'Settings', icon: 'cog-outline', color: '#64748B', bg: '#F1F5F9' },
                  { to: 'Profile', label: 'Profile', icon: 'account-outline', color: '#3B82F6', bg: '#DBEAFE' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.to}
                    style={ms.drawerGridItem}
                    onPress={() => {
                      setMenuOpen(false);
                      navigation.navigate(item.to);
                    }}
                  >
                    <View style={[ms.drawerGridIcon, { backgroundColor: item.bg }]}>
                      <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <Text style={ms.drawerGridLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={ms.drawerLogoutBtn}
                onPress={async () => {
                  setMenuOpen(false);
                  await signOut();
                  navigation.navigate('Auth');
                }}
              >
                <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={ms.drawerLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 99,
  },
  drawerContent: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 84 : 72,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    zIndex: 100,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  drawerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  drawerAvatarImg: {
    width: 44,
    height: 44,
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  drawerUserInfo: {
    flex: 1,
  },
  drawerUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  drawerUserEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  drawerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  drawerGridItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerGridIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerGridLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  drawerLogoutText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
