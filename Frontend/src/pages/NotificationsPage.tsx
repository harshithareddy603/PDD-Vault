/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useDocuments } from '../hooks/useDocuments';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { calculateMilestone, NotificationService } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';

const NotificationsPage = () => {
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Dynamic statistics
  const expiringSoonCount = documents.filter((d) => d.status === 'soon').length;
  const expiredCount = documents.filter((d) => d.status === 'expired').length;
  const activeAlertsCount = expiringSoonCount + expiredCount;

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-CA');
  };

  // Compile active alerts from real document status with Milestone Info
  const activeAlerts = useMemo(() => {
    return documents
      .filter((d) => d.status !== 'safe')
      .map((d) => {
        const info = calculateMilestone(d.expiry_date);
        return {
          id: d.id,
          message: `${d.name}: ${info.message}`,
          date: formatDate(d.expiry_date),
          isExpired: d.status === 'expired',
          milestoneInfo: info,
          document: d,
        };
      })
      .sort((a, b) => {
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        return a.milestoneInfo.minutesLeft - b.milestoneInfo.minutesLeft;
      });
  }, [documents]);

  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setPermissionGranted(granted);
    if (granted) {
      await NotificationService.postStatusBarNotification(
        "🔔 Status Bar Notifications Enabled!",
        "You will receive alerts in your phone's status bar for 1-hour, 1-day, and weekly document expiries."
      );
      if (Platform.OS === 'web') alert("Status bar / desktop notifications enabled!");
      else Alert.alert("Success", "Mobile status bar notifications are enabled!");
    } else {
      if (Platform.OS === 'web') alert("Notification permission was denied.");
      else Alert.alert("Permission Denied", "Please allow notifications in your device settings.");
    }
  };

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={[s.pageTitle, { color: colors.text }]}>Alerts & Reminders</Text>
        <Text style={[s.subtitle, { color: colors.subtext }]}>{activeAlertsCount} active alert{activeAlertsCount !== 1 ? 's' : ''}</Text>
      </View>

      {/* Quick Enable Mobile Status Bar Notification Banner */}
      <View style={[s.enableBanner, { backgroundColor: isDark ? '#1e293b' : '#EFF6FF', borderColor: colors.border }]}>
        <View style={s.enableBannerLeft}>
          <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#3B82F6" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[s.enableBannerTitle, { color: colors.text }]}>Mobile Top Status Bar Notifications</Text>
            <Text style={[s.enableBannerSub, { color: colors.subtext }]}>
              Receive status bar tray alerts for 1-hour, 1-day, and weekly expiry reminders.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={s.enableBtn} onPress={handleEnableNotifications} activeOpacity={0.8}>
          <Text style={s.enableBtnText}>
            {permissionGranted ? 'Active ✓' : 'Enable Status Bar Alerts'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top 3 Quick Stats Cards */}
      <View style={s.statsGrid}>
        {/* Card 1: Expiring Soon */}
        <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[s.iconBox, { backgroundColor: isDark ? '#332010' : '#FFF7ED' }]}>
            <Feather name="clock" size={17} color="#F97316" />
          </View>
          <Text style={[s.cardTitle, { color: colors.text }]}>Expiring Soon</Text>
          <Text style={[s.cardValue, s.orangeText]}>{expiringSoonCount}</Text>
          <Text style={[s.cardDesc, { color: colors.subtext }]}>Documents expiring within 30 days</Text>
        </View>

        {/* Card 2: Expired */}
        <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[s.iconBox, { backgroundColor: isDark ? '#3b1212' : '#FEE2E2' }]}>
            <Feather name="alert-circle" size={17} color="#EF4444" />
          </View>
          <Text style={[s.cardTitle, { color: colors.text }]}>Expired</Text>
          <Text style={[s.cardValue, s.redText]}>{expiredCount}</Text>
          <Text style={[s.cardDesc, { color: colors.subtext }]}>Documents that have expired</Text>
        </View>

        {/* Card 3: Reminder Settings */}
        <TouchableOpacity
          style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <View style={[s.iconBox, { backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF' }]}>
            <Feather name="bell" size={17} color="#3B82F6" />
          </View>
          <Text style={[s.cardTitle, { color: colors.text }]}>Reminder Settings</Text>
          <Text style={[s.cardDesc, { color: colors.subtext, marginTop: 12 }]}>Configure your notification preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Active Alerts Panel */}
      <View style={[s.panelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.panelTitle, { color: colors.text }]}>Active Expiry Milestone Alerts</Text>

        <View style={s.alertsList}>
          {activeAlerts.length === 0 ? (
            <View style={s.emptyState}>
              <Feather name="bell-off" size={32} color={colors.subtext} />
              <Text style={[s.emptyStateText, { color: colors.subtext }]}>No active alerts at the moment.</Text>
            </View>
          ) : (
            activeAlerts.map((alert) => {
              const { milestoneInfo } = alert;
              return (
                <View
                  key={alert.id}
                  style={[
                    s.alertRow,
                    {
                      backgroundColor: isDark
                        ? alert.isExpired
                          ? '#3b1212'
                          : '#1e293b'
                        : milestoneInfo.badgeBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={s.alertLeft}>
                    <View
                      style={[
                        s.alertIconCircle,
                        { backgroundColor: milestoneInfo.badgeBg },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={milestoneInfo.icon as any}
                        size={18}
                        color={milestoneInfo.badgeColor}
                      />
                    </View>
                    <View style={s.alertMeta}>
                      <View style={s.badgePillWrap}>
                        <View style={[s.milestonePill, { backgroundColor: milestoneInfo.badgeColor }]}>
                          <Text style={s.milestonePillText}>{milestoneInfo.label}</Text>
                        </View>
                      </View>
                      <Text style={[s.alertMessage, { color: colors.text, marginTop: 4 }]}>
                        {alert.message}
                      </Text>
                      <Text style={[s.alertDate, { color: colors.subtext }]}>
                        Expiry Date: {alert.date}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[s.viewBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.navigate('Documents', { search: alert.document.name })}
                  >
                    <Text style={s.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
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
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  enableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  enableBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 240,
  },
  enableBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  enableBannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  enableBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  enableBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  badgePillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  milestonePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  milestonePillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 200 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  orangeBg: { backgroundColor: '#FFF7ED' },
  redBg: { backgroundColor: '#FEE2E2' },
  blueBg: { backgroundColor: '#EFF6FF' },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 4,
  },
  orangeText: { color: '#F97316' },
  redText: { color: '#EF4444' },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  // Active Alerts List
  panelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  alertsList: {
    gap: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  expiringAlertBg: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  expiredAlertBg: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEE2E2',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  alertIconOrange: { backgroundColor: '#FEF3C7' },
  alertIconRed: { backgroundColor: '#FEE2E2' },
  alertMeta: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
    color: '#64748B',
  },
  viewBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  viewBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});

export default NotificationsPage;
