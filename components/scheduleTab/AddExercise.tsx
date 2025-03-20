import { StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { InputExercise } from '@/database/types';

interface AddExerciseProps {
  newExercise: InputExercise;
  setNewExercise: (exercise: InputExercise) => void;
  onSaveNewExercise: () => Promise<void>;
  onBack: () => void;
}

export function AddExercise({ newExercise, setNewExercise, onSaveNewExercise, onBack }: AddExerciseProps) {
  return (
    <>
      <ThemedText type='title'>Add Exercise</ThemedText>
      <ThemedView style={styles.container}>
        <TextInput
          placeholder='Name'
          value={newExercise.name}
          onChangeText={text => setNewExercise({ ...newExercise, name: text })}
          style={styles.input}
        />
        <ThemedView style={styles.inputContainer}>
          <TextInput
            placeholder='Weight'
            keyboardType='numeric'
            value={newExercise.weight === '' ? '' : newExercise.weight.toString()}
            onChangeText={text => setNewExercise({ ...newExercise, weight: text })}
            style={[styles.input, styles.inputItem]}
          />
          <TextInput
            placeholder='Increment'
            keyboardType='numeric'
            value={newExercise.increment === '' ? '' : newExercise.increment.toString()}
            onChangeText={text => setNewExercise({ ...newExercise, increment: text })}
            style={[styles.input, styles.inputItem]}
          />
        </ThemedView>
        <ThemedView>
          <ThemedText>Is One Arm?</ThemedText>
          <Switch
            value={newExercise.isOneArm}
            onValueChange={value => setNewExercise({ ...newExercise, isOneArm: value })}
            trackColor={{ true: '#1D3D6C' }}
            style={styles.switch}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          mode='contained'
          onPress={onSaveNewExercise}
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
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 20
  },
  inputContainer: {
    flexDirection: 'row', gap: 10
  },
  inputItem: {
    flex: 1
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
  }
});
