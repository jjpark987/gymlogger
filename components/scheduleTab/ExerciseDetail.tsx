import { StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise } from '@/database/types';

interface ExerciseDetailProps {
  exercise: Exercise;
  setExercise: (updatedExercise: Exercise) => void;
  onSaveExercise: () => Promise<void>;
  onBack: () => void;
  onDelete: (exercise: Exercise) => Promise<void>;
}

export function ExerciseDetail({ exercise, setExercise, onSaveExercise, onBack, onDelete }: ExerciseDetailProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{exercise.name}</ThemedText>
      </ThemedView>
      <ThemedView>
        {/* Show line graph or message if no logs exist */}
        {false ? (
          <ThemedText>[Line Graph Placeholder]</ThemedText>
        ) : (
          <ThemedText>No logs available for this exercise.</ThemedText>
        )}
      </ThemedView>
      <ThemedView style={styles.formContainer}>
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
      <ThemedView style={styles.formButtonContainer}>
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
          onPress={onBack} 
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        <Button 
          mode='contained'
          onPress={() => onDelete(exercise)}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formContainer: {
    gap: 10,
    marginTop: 20
  },
  formButtonContainer: {
    gap: 20
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 10,
  },
  switch: {
    transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }],
    marginTop: 10,
    marginBottom: 30,
    marginLeft: 10
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
  delButton: {
    backgroundColor: '#6C1D1D',
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 50,
    marginBottom: 50
  }
});
