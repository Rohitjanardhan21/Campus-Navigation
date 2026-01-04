import { NavigationStep } from '@/features/navigation/mapboxRouting';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InstructionsPanelProps {
  instructions: NavigationStep[];
  currentInstructionIndex: number;
  visible: boolean;
  onClose: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({
  instructions,
  currentInstructionIndex,
  visible,
  onClose
}) => {
  const getInstructionIcon = (instruction: NavigationStep): string => {
    switch (instruction.type) {
      case 'start':
        return 'play-circle';
      case 'turn':
        return instruction.direction === 'left' ? 'arrow-back' : 'arrow-forward';
      case 'continue':
        return 'arrow-up';
      case 'arrive':
        return 'flag';
      default:
        return 'navigate';
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

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
            <Text style={styles.headerTitle}>Turn-by-Turn Directions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#5F6368" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.instructionsList}>
            {instructions.map((instruction, index) => (
              <View 
                key={instruction.id} 
                style={[
                  styles.instructionItem,
                  index === currentInstructionIndex && styles.currentInstruction,
                  index < currentInstructionIndex && styles.completedInstruction
                ]}
              >
                <View style={styles.stepNumber}>
                  <Text style={[
                    styles.stepNumberText,
                    index === currentInstructionIndex && styles.currentStepText,
                    index < currentInstructionIndex && styles.completedStepText
                  ]}>
                    {index + 1}
                  </Text>
                </View>

                <View style={[
                  styles.iconContainer,
                  index === currentInstructionIndex && styles.currentIconContainer,
                  index < currentInstructionIndex && styles.completedIconContainer
                ]}>
                  <Ionicons 
                    name={getInstructionIcon(instruction) as any} 
                    size={20} 
                    color={
                      index < currentInstructionIndex ? '#34A853' :
                      index === currentInstructionIndex ? '#1A73E8' : '#9AA0A6'
                    }
                  />
                </View>

                <View style={styles.instructionContent}>
                  <Text style={[
                    styles.instructionText,
                    index === currentInstructionIndex && styles.currentInstructionText,
                    index < currentInstructionIndex && styles.completedInstructionText
                  ]}>
                    {instruction.instruction}
                  </Text>

                  {instruction.distance > 0 && (
                    <View style={styles.instructionMeta}>
                      <Text style={styles.metaText}>
                        {formatDistance(instruction.distance)}
                      </Text>
                      {instruction.duration > 0 && (
                        <>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.metaText}>
                            {formatDuration(instruction.duration)}
                          </Text>
                        </>
                      )}
                      {instruction.landmark && (
                        <>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.landmarkText}>
                            Near {instruction.landmark}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>

                {index === currentInstructionIndex && (
                  <View style={styles.currentIndicator}>
                    <Ionicons name="radio-button-on" size={12} color="#1A73E8" />
                  </View>
                )}

                {index < currentInstructionIndex && (
                  <View style={styles.completedIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#34A853" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Step {currentInstructionIndex + 1} of {instructions.length}
            </Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
  },
  closeButton: {
    padding: 4,
  },
  instructionsList: {
    flex: 1,
    padding: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: 12,
  },
  currentInstruction: {
    backgroundColor: '#E8F0FE',
    borderWidth: 2,
    borderColor: '#1A73E8',
  },
  completedInstruction: {
    backgroundColor: '#E6F4EA',
    opacity: 0.8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8EAED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
  },
  currentStepText: {
    color: '#1A73E8',
  },
  completedStepText: {
    color: '#34A853',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIconContainer: {
    backgroundColor: '#1A73E8',
  },
  completedIconContainer: {
    backgroundColor: '#34A853',
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 4,
  },
  currentInstructionText: {
    fontWeight: '600',
    color: '#1A73E8',
  },
  completedInstructionText: {
    color: '#5F6368',
  },
  instructionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: '#5F6368',
    fontWeight: '500',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  landmarkText: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '500',
  },
  currentIndicator: {
    alignSelf: 'center',
  },
  completedIndicator: {
    alignSelf: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },
});

export default InstructionsPanel;