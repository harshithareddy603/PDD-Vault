import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Image } from 'react-native'
import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  onDelete: () => void;
  isDownloading: boolean;
  isDeleting?: boolean;
}

export const BulkActionBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  onDelete,
  isDownloading,
  isDeleting,
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.countText}>{selectedCount} selected</Text>
        <View style={styles.divider} />
        <TouchableOpacity 
          onPress={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          style={styles.ghostButton}
        >
          {selectedCount === totalCount ? (
            <View style={styles.buttonContent}>
              <Feather name="minus-square" size={14} color="#64748B" style={styles.icon} />
              <Text style={styles.ghostButtonText}>Deselect All</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Feather name="check-square" size={14} color="#64748B" style={styles.icon} />
              <Text style={styles.ghostButtonText}>Select All</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity 
          onPress={onDownload} 
          disabled={isDownloading || isDeleting}
          style={[styles.primaryButton, (isDownloading || isDeleting) && styles.disabledButton]}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
          ) : (
            <Feather name="download" size={16} color="#fff" style={styles.icon} />
          )}
          <Text style={styles.primaryButtonText}>Download ZIP</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onDelete} 
          disabled={isDownloading || isDeleting}
          style={[styles.deleteButton, (isDownloading || isDeleting) && styles.disabledButton]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
          ) : (
            <Feather name="trash-2" size={16} color="#fff" style={styles.icon} />
          )}
          <Text style={styles.primaryButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 40,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 16,
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  ghostButton: {
    height: 32,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: 12,
    color: '#64748B',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    marginRight: 6,
  },
});
