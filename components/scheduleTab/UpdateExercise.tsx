import { Button, Switch, TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise } from '@/database/types';

interface UpdateExerciseProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  onBack: () => void;
  onSaveExercise: () => Promise<void>;
  onDeleteExercise: (exercise: Exercise) => Promise<void>;
}

export function UpdateExercise({ exercise, setExercise, onBack, onSaveExercise, onDeleteExercise }: UpdateExerciseProps) {
  return (
    <>
      <ThemedView style={styles.contentContainer}>
        <TextInput
          placeholder='Name'
          value={exercise.name}
          onChangeText={text => setExercise({ ...exercise, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder='Weight'
          keyboardType='numeric'
          value={exercise.weight.toString()}
          onChangeText={text => setExercise({ ...exercise, weight: parseFloat(text) || 0 })}
          style={styles.input}
        />
        <ThemedView>
          <ThemedText>Is One Arm?</ThemedText>
          <Switch
            value={!!exercise.isOneArm}
            onValueChange={value => setExercise({ ...exercise, isOneArm: value })}
            trackColor={{ true: '#1D3D6C' }}
            style={styles.switch}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          mode='contained'
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        <Button
          mode='contained'
          onPress={onSaveExercise}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save
        </Button>
        <Button
          mode='contained'
          onPress={() => onDeleteExercise(exercise)}
          style={styles.delButton}
          labelStyle={styles.buttonLabel}
        >
          Delete
        </Button>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 20,
    marginTop: 20
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18
  },
  switch: {
    transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }],
    marginTop: 10,
    marginLeft: 10
  },
  buttonContainer: {
    gap: 30,
    marginTop: 30
  },
  buttonLabel: {
    fontSize: 18
  },
  button: {
    backgroundColor: '#1D3D6C',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  delButton: {
    backgroundColor: '#6C1D1D',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
    marginVertical: 50,
  }
});
