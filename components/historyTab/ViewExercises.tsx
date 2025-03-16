import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise, LoggedDay, LoggedWeek } from '@/database/types';

interface ViewExercisesProps {
  week: LoggedWeek;
  day: LoggedDay;
  exercises: (Exercise | null)[];
  onSelectExercise: (day: LoggedDay, exercise: Exercise) => void;
  onBack: () => void;
}

export function ViewExercises({ week, day, exercises, onSelectExercise, onBack }: ViewExercisesProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{week.display} {day.display.slice(0, 3)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
        {exercises.map((exercise, index) =>
          exercise ? (
            <Button
              key={index}
              mode='contained'
              onPress={() => onSelectExercise(day, exercise)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {exercise.name}
            </Button>
          ) : (
            <ThemedView key={index} style={styles.placeholderButton}>
              <ThemedText style={styles.placeholderText}>-</ThemedText>
            </ThemedView>
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
    gap: 8,
  },
  contentContainer: {
    gap: 20,
    marginTop: 20
  },
  button: {
    backgroundColor: '#1D6A47',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  buttonLabel: {
    fontSize: 18
  },
  placeholderButton: {
    backgroundColor: '#1D6A47',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    height: 50,
  },
  placeholderText: {
    fontSize: 18
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
  },
});
