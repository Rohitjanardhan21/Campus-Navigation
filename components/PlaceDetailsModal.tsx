import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusPlace } from '@/src/domain/campus';

const iconMap: Record<string, string> = {
  academic: 'school',
  library: 'library',
  food: 'restaurant',
  sports: 'basketball',
  admin: 'business',
  shopping: 'cart',
  building: 'business',
  university: 'school',
  garden: 'leaf',
  landmark: 'map',
  entrance: 'enter',
  hostel: 'home',
  default: 'location'
};

interface PlaceDetailsModalProps {
  visible: boolean;
  place: CampusPlace | null;
  onClose: () => void;
  onStartNavigation: (place: CampusPlace) => void;
}

const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ visible, place, onClose, onStartNavigation }) => {
  if (!place) return null;

  // Mock data for place details
  const placeDetails = {
    rating: 4.5,
    reviews: 120,
    hours: "Open until 8:00 PM",
    website: "www.example.com",
    phone: "(123) 456-7890"
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeaderBar}>
            <View style={styles.modalHeaderHandle} />
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#5f6368" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons
                  name={(iconMap[place.type] || iconMap.default) as any}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{place.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {place.type}
                </Text>
                {placeDetails.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{placeDetails.rating}</Text>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.floor(placeDetails.rating) ? "star" : "star-outline"}
                          size={14}
                          color={star <= Math.floor(placeDetails.rating) ? "#FBBC04" : "#DADCE0"}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewsText}>({placeDetails.reviews})</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="navigate" size={20} color="#4285F4" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="save" size={20} color="#4285F4" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social" size={20} color="#4285F4" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#5f6368" style={styles.infoIcon} />
                <Text style={styles.infoText}>{placeDetails.hours}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="globe" size={20} color="#5f6368" style={styles.infoIcon} />
                <Text style={styles.infoText}>{placeDetails.website}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#5f6368" style={styles.infoIcon} />
                <Text style={styles.infoText}>{placeDetails.phone}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.startNavigationButton}
              onPress={() => onStartNavigation(place)}
            >
              <Text style={styles.startNavigationButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeaderBar: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  modalHeaderHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#DADCE0',
    borderRadius: 3,
    marginBottom: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
  },
  modalScrollView: {
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#5F6368',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginRight: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#5F6368',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EAED',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '500',
  },
  modalInfoSection: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#202124',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  startNavigationButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startNavigationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlaceDetailsModal;


