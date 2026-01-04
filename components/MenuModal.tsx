import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onHelp?: () => void;
  onFeedback?: () => void;
  onShare?: () => void;
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, color = '#202124' }) => {
  // const { theme } = useTheme();
  // const styles = createStyles(theme);
  const styles = createStyles(null);
  
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
    </TouchableOpacity>
  );
};

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, onSettings, onAbout, onHelp, onFeedback, onShare }) => {
  // const { theme } = useTheme();
  const styles = createStyles(null);
  
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
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#5F6368" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuList}>
            {onSettings && (
              <MenuItem
                icon="settings-outline"
                title="Settings"
                subtitle="App preferences and configuration"
                onPress={onSettings}
                color="#1A73E8"
              />
            )}

            {onAbout && (
              <MenuItem
                icon="information-circle-outline"
                title="About"
                subtitle="App version and information"
                onPress={onAbout}
                color="#34A853"
              />
            )}

            {onHelp && (
              <MenuItem
                icon="help-circle-outline"
                title="Help & Support"
                subtitle="Get help and tutorials"
                onPress={onHelp}
                color="#FBBC04"
              />
            )}

            {onFeedback && (
              <MenuItem
                icon="chatbubble-outline"
                title="Send Feedback"
                subtitle="Share your thoughts"
                onPress={onFeedback}
                color="#EA4335"
              />
            )}

            {onShare && (
              <MenuItem
                icon="share-social-outline"
                title="Share App"
                subtitle="Share with friends"
                onPress={onShare}
                color="#9334E6"
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#5F6368',
  },
});

export default MenuModal;


