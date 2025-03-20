import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { Day, Exercise } from '@/database/types';

interface ExerciseSelectionProps {
  day: Day;
  exercises: (Exercise | null)[];
  onSelectExercise: (exercise: Exercise | null) => void;
}

export function ExerciseSelection({ day, exercises, onSelectExercise }: ExerciseSelectionProps) {
  return (
    <>
      <ThemedText type='title'>{day.name}</ThemedText>
      <ThemedView style={styles.container}>
        {exercises.map((exercise, index) =>
          <Button
            key={index}
            mode='contained'
            onPress={() => onSelectExercise(exercise)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {exercise ? exercise.name : '-'}
          </Button>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 40,
    marginTop: 20
  },
  buttonLabel: {
    fontSize: 18
  },
  button: {
    backgroundColor: '#1D3D47',
    paddingVertical: 10,
    borderRadius: 5
  }
});
