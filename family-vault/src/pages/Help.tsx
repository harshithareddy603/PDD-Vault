/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Help Card Component ─────────────────────────────────────────────────────

interface HelpCardProps {
  title: string;
  subtitle: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  isFeather?: boolean;
}

const HelpCard = ({
  title,
  subtitle,
  iconName,
  iconBg,
  iconColor,
  isFeather = false,
}: HelpCardProps) => (
  <TouchableOpacity style={s.helpCard} activeOpacity={0.75}>
    <View style={[s.iconBox, { backgroundColor: iconBg }]}>
      {isFeather ? (
        <Feather name={iconName as any} size={18} color={iconColor} />
      ) : (
        <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
      )}
    </View>
    <Text style={s.cardTitle}>{title}</Text>
    <Text style={s.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// ─── Popular Topic Row ───────────────────────────────────────────────────────

const TopicRow = ({ title }: { title: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={s.topicItem}>
      <TouchableOpacity
        style={s.topicTrigger}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={s.topicText}>{title}</Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#64748B"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={s.topicBody}>
          <Text style={s.topicBodyText}>
            To view detailed instructions on "{title}", please read our full support documentation or contact support above if you need one-on-one assistance.
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── Main Help Center Screen ─────────────────────────────────────────────────

const Help = () => {
  const isWeb = Platform.OS === 'web';

  const topics = [
    'How to upload documents',
    'Setting up expiry reminders',
    'Managing family members',
    'Security and privacy settings',
    'Backing up your documents',
  ];

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.pageTitle}>Help Center</Text>
      </View>

      {/* Grid of support pathways */}
      <View style={s.helpGrid}>
        <HelpCard
          title="FAQs"
          subtitle="Common questions and answers"
          iconName="help-circle"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          isFeather
        />
        <HelpCard
          title="Documentation"
          subtitle="Complete user guide and tutorials"
          iconName="book"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          isFeather
        />
        <HelpCard
          title="Contact Support"
          subtitle="Get help from our support team"
          iconName="message-square"
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
          isFeather
        />
      </View>

      {/* Popular Topics Section */}
      <View style={s.topicsSection}>
        <Text style={s.sectionTitle}>Popular Topics</Text>
        <View style={s.topicsList}>
          {topics.map((t) => (
            <TopicRow key={t} title={t} />
          ))}
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
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  helpCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 200 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  topicsSection: {
    width: '100%',
    maxWidth: 960,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  topicsList: {
    gap: 10,
  },
  topicItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  topicTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topicText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  topicBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
  },
  topicBodyText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
});

export default Help;
