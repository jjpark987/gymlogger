import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Day, Exercise } from '@/database/types';

interface ExerciseSelectionProps {
  day: Day;
  exercises: (Exercise | null)[];
  onSelectExercise: (exercise: Exercise | null) => void;
  onSaveLogs: () => Promise<void>;
}

export function ExerciseSelection({ day, exercises, onSelectExercise, onSaveLogs }: ExerciseSelectionProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{day.name}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
        {exercises.map((exercise, index) => (
          <Button
            key={index}
            mode='contained'
            onPress={() => onSelectExercise(exercise)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {exercise ? exercise.name : '-'}
          </Button>
        ))}
        <Button
          mode='contained'
          onPress={onSaveLogs}
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
        >
          Save
        </Button>
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
  button: {
    backgroundColor: '#1D3D47',
    paddingVertical: 5,
    borderRadius: 5
  },
  buttonLabel: {
    fontSize: 18
  },
  saveButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 5,
    borderRadius: 5,
  }
});

