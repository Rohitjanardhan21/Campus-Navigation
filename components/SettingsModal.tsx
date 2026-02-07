import { useNavigationHistory } from '@/contexts/NavigationHistoryContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  type?: 'switch' | 'arrow';
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, value, onValueChange, type = 'switch' }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon as any} size={24} color="#1A73E8" style={styles.settingIcon} />
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#1A73E8' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    )}
    {type === 'arrow' && (
      <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
    )}
  </View>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  // Provide defaults in case contexts aren't available
  let settings = { 
    voiceGuidance: true, 
    autoReroute: true, 
    darkMode: false, 
    saveHistory: true, 
    notifications: true 
  };
  let updateSetting = async () => {};
  let clearHistory = async () => {};
  
  try {
    const settingsContext = useSettings();
    settings = settingsContext.settings;
    updateSetting = settingsContext.updateSetting;
  } catch (e) {
    console.warn('Settings context not available in modal');
  }
  
  try {
    const historyContext = useNavigationHistory();
    clearHistory = historyContext.clearHistory;
  } catch (e) {
    console.warn('Navigation history context not available in modal');
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#202124" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.settingsList}>
            <SectionHeader title="NAVIGATION" />
            <SettingItem
              icon="volume-high-outline"
              title="Voice Guidance"
              subtitle="Turn-by-turn voice instructions"
              value={settings.voiceGuidance}
              onValueChange={(value) => updateSetting('voiceGuidance', value)}
            />
            <SettingItem
              icon="git-branch-outline"
              title="Auto Reroute"
              subtitle="Automatically find new routes"
              value={settings.autoReroute}
              onValueChange={(value) => updateSetting('autoReroute', value)}
            />

            <SectionHeader title="APPEARANCE" />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Use dark theme"
              value={settings.darkMode}
              onValueChange={(value) => updateSetting('darkMode', value)}
            />

            <SectionHeader title="PRIVACY" />
            <SettingItem
              icon="time-outline"
              title="Save History"
              subtitle="Keep navigation history"
              value={settings.saveHistory}
              onValueChange={(value) => updateSetting('saveHistory', value)}
            />
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Allow push notifications"
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
            />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Clear History',
                  'Are you sure you want to clear all navigation history?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear', 
                      style: 'destructive',
                      onPress: () => {
                        clearHistory();
                        Alert.alert('Success', 'Navigation history cleared');
                      }
                    },
                  ]
                );
              }}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={24} color="#EA4335" style={styles.settingIcon} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: '#EA4335' }]}>Clear History</Text>
                  <Text style={styles.settingSubtitle}>Delete all navigation history</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
            </TouchableOpacity>

            <SectionHeader title="GENERAL" />
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={24} color="#1A73E8" style={styles.settingIcon} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Language</Text>
                  <Text style={styles.settingSubtitle}>English</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="map-outline" size={24} color="#1A73E8" style={styles.settingIcon} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Map Style</Text>
                  <Text style={styles.settingSubtitle}>Street View</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
            </TouchableOpacity>

            <SectionHeader title="ABOUT" />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2025.01.12</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
  },
  settingsList: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#5F6368',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  infoLabel: {
    fontSize: 16,
    color: '#5F6368',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
  },
});

export default SettingsModal;


