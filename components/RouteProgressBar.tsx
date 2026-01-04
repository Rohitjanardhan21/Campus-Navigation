import { NavigationStep } from '@/features/navigation/mapboxRouting';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface RouteProgress {
  currentStepIndex: number;
  distanceToNextStep: number;
  totalDistanceRemaining: number;
  estimatedTimeRemaining: number;
  isOffRoute: boolean;
}

interface RouteProgressBarProps {
  currentInstruction: NavigationStep | null;
  progress: RouteProgress;
  isNavigating: boolean;
}

const RouteProgressBar: React.FC<RouteProgressBarProps> = ({
  currentInstruction,
  progress,
  isNavigating
}) => {
  if (!isNavigating || !currentInstruction) return null;

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

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

  return (
    <View style={styles.container}>
      {progress.isOffRoute && (
        <View style={styles.offRouteWarning}>
          <Ionicons name="warning" size={16} color="#EA4335" />
          <Text style={styles.offRouteText}>Off route - Recalculating...</Text>
        </View>
      )}
      
      <View style={styles.instructionContainer}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getInstructionIcon(currentInstruction) as any} 
            size={24} 
            color="#1A73E8" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.instructionText} numberOfLines={2}>
            {currentInstruction.instruction}
          </Text>
          
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              {formatDistance(progress.distanceToNextStep)}
            </Text>
            {currentInstruction.type !== 'arrive' && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.timeText}>
                  {formatTime(progress.estimatedTimeRemaining)} remaining
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${Math.max(10, 100 - (progress.totalDistanceRemaining / 1000) * 10)}%` 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  offRouteWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7F0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  offRouteText: {
    color: '#EA4335',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8',
  },
  separator: {
    fontSize: 14,
    color: '#9AA0A6',
  },
  timeText: {
    fontSize: 14,
    color: '#5F6368',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#E8EAED',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1A73E8',
    borderRadius: 2,
  },
});

export default RouteProgressBar;