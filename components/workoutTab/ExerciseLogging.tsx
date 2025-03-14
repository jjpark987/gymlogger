import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { DayLogs, Exercise } from '@/database/types';

interface ExerciseLoggingProps {
  selectedExercise: Exercise;
  dayLogs: DayLogs;
  onRepsChange: (exerciseId: number, setIndex: number, text: string, isLeft: boolean | null) => void;
  onBack: () => void;
}

export function ExerciseLogging({ selectedExercise, dayLogs, onRepsChange, onBack }: ExerciseLoggingProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{selectedExercise.name}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
      {selectedExercise.isOneArm ? (
        <>
          <ThemedView style={styles.rowContainer}>
            <ThemedView style={styles.column}>
              {Array.from({ length: 4 }, (_, index) => (
                <TextInput
                  key={`left-${index}`}
                  placeholder={`Set ${index + 1}`}
                  keyboardType='numeric'
                  value={dayLogs[selectedExercise.id]?.left[index]?.toString() || ''}
                  onChangeText={text => onRepsChange(selectedExercise.id, index, text, true)}
                  style={styles.input}
                />
              ))}
            </ThemedView>
            <ThemedView style={styles.column}>
              {Array.from({ length: 4 }, (_, index) => (
                <TextInput
                  key={`right-${index}`}
                  placeholder={`Set ${index + 1}`}
                  keyboardType='numeric'
                  value={dayLogs[selectedExercise.id]?.right[index]?.toString() || ''}
                  onChangeText={text => onRepsChange(selectedExercise.id, index, text, false)}
                  style={styles.input}
                />
              ))}
            </ThemedView>
          </ThemedView>
          <Button 
            mode='contained'
            onPress={onBack} 
            style={styles.backButton}
            labelStyle={styles.buttonLabel}
          >
            Back
          </Button>
        </>
      ) : (
        <>
          <ThemedView style={styles.formContainer}>
            {Array.from({ length: 4 }, (_, index) => (
              <TextInput
                key={`set-${index}`}
                placeholder={`Set ${index + 1}`}
                keyboardType='numeric'
                value={dayLogs[selectedExercise.id]?.right[index]?.toString() || ''}
                onChangeText={text => onRepsChange(selectedExercise.id, index, text, null)}
                style={styles.input}
              />
            ))}
          </ThemedView>
          <Button 
            mode='contained'
            onPress={onBack} 
            style={styles.backButton}
            labelStyle={styles.buttonLabel}
          >
            Back
          </Button>
        </>
      )}
      </ThemedView>
    </>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentContainer: {
    gap: 20,
    marginTop: 20
  },
  formContainer: {
    gap: 10
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5
  },
  buttonLabel: {
    fontSize: 18
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
  },
  column: {
    width: '48%',
    gap: 10
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 10,
  },
});
