import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal } from 'react-native'
import React from "react";
import type { DocumentRow } from "../services/supabase";
import { Feather } from '@expo/vector-icons';

interface NotificationsSheetProps {
  documents: DocumentRow[];
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsSheet = ({ documents, isOpen, onClose }: NotificationsSheetProps) => {
  const now = new Date();
  
  const notifications = documents
    .filter((d) => d.status === "expired" || d.status === "soon")
    .map((d) => {
      let daysLeft = 0;
      if (d.expiry_date) {
        const exp = new Date(d.expiry_date);
        daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...d, daysLeft };
    })
    .sort((a, b) => {
      if (a.status === "expired" && b.status !== "expired") return -1;
      if (b.status === "expired" && a.status !== "expired") return 1;
      return a.daysLeft - b.daysLeft;
    });

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.list}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expiring documents 🎉</Text>
              </View>
            ) : (
              notifications.map((d) => (
                <View key={d.id} style={styles.notificationItem}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemName} numberOfLines={1}>{d.name}</Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{d.category}</Text>
                      </View>
                      <Text style={styles.expiryText}>{d.expiry_date}</Text>
                    </View>
                  </View>
                  {d.status === "expired" ? (
                    <View style={styles.expiredBadge}>
                      <Text style={styles.badgeText}>EXPIRED</Text>
                    </View>
                  ) : (
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonBadgeText}>{d.daysLeft} days left</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  itemMain: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#64748B',
  },
  expiryText: {
    fontSize: 11,
    color: '#64748B',
  },
  expiredBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  soonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  soonBadgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '600',
  },
});
