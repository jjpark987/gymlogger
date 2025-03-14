import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Day, Exercise } from '@/database/types';

interface ExercisesOverviewProps {
  day: Day;
  exercises: (Exercise | null)[];
  onSelectExercise: (exercise: Exercise) => Promise<void>;
  onSelectSlot: (orderNum: number) => void;
  onBack: () => void;
}

export function ExercisesOverview({ day, exercises, onSelectExercise, onSelectSlot, onBack }: ExercisesOverviewProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{day.name}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
        {exercises.map((exercise, index) =>
          exercise ? (
            <Button
              key={index}
              mode='contained'
              onPress={() => onSelectExercise(exercise)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {exercise.name}
            </Button>
          ) : (
            <Button
              key={index}
              mode='contained'
              onPress={() => onSelectSlot(index + 1)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              +
            </Button>
          )
        )}
        <Button
          mode='contained'
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
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
    backgroundColor: '#1D3D6C',
    paddingVertical: 5,
    borderRadius: 5
  },
  buttonLabel: {
    fontSize: 18
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
  },
});
