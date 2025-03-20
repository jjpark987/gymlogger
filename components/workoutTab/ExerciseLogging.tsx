import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { DayLogs, Exercise } from '@/database/types';

interface ExerciseLoggingProps {
  selectedExercise: Exercise | null;
  dayLogs: DayLogs;
  onRepsChange: (exerciseId: number, setIndex: number, value: string, isLeft: boolean | null) => void;
  onBack: () => void;
}

export function ExerciseLogging({ selectedExercise, dayLogs, onRepsChange, onBack }: ExerciseLoggingProps) {
  if (!selectedExercise) return;
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{selectedExercise.name}</ThemedText>
        <ThemedText>{selectedExercise.weight} lbs</ThemedText>
      </ThemedView>
      {selectedExercise.isOneArm ?
        <ThemedView style={styles.oneArmLogger}>
          <ThemedView style={styles.oneArmLoggerCol}>
            {Array.from({ length: 4 }, (_, index) =>
              <TextInput
                key={`left-${index}`}
                placeholder={`Set ${index + 1}`}
                keyboardType='numeric'
                value={dayLogs[selectedExercise.id]?.left[index] !== undefined ? String(dayLogs[selectedExercise.id]?.left[index]) : ''}
                onChangeText={value => onRepsChange(selectedExercise.id, index, value, true)}
                style={styles.input}
              />
            )}
          </ThemedView>
          <ThemedView style={styles.oneArmLoggerCol}>
            {Array.from({ length: 4 }, (_, index) =>
              <TextInput
                key={`right-${index}`}
                placeholder={`Set ${index + 1}`}
                keyboardType='numeric'
                value={dayLogs[selectedExercise.id]?.right[index] !== undefined ? String(dayLogs[selectedExercise.id]?.right[index]) : ''}
                onChangeText={value => onRepsChange(selectedExercise.id, index, value, false)}
                style={styles.input}
              />
            )}
          </ThemedView>
        </ThemedView>
        :
        <ThemedView style={styles.twoArmLogger}>
          {Array.from({ length: 4 }, (_, index) =>
            <TextInput
              key={`set-${index}`}
              placeholder={`Set ${index + 1}`}
              keyboardType='numeric'
              value={dayLogs[selectedExercise.id]?.left[index] !== undefined ? String(dayLogs[selectedExercise.id]?.left[index]) : ''}
              onChangeText={value => onRepsChange(selectedExercise.id, index, value, null)}
              style={styles.input}
            />
          )}
        </ThemedView>
      }
      <Button
        mode='contained'
        onPress={onBack}
        style={styles.backButton}
        labelStyle={styles.buttonLabel}
      >
        Back
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8
  },
  oneArmLogger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  oneArmLoggerCol: {
    width: '48%',
    gap: 20
  },
  twoArmLogger: {
    gap: 20,
    marginTop: 20
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18,
  },
  buttonLabel: {
    fontSize: 18
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 30
  }
});
