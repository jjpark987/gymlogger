import { StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { NewExercise } from '@/database/types';

interface AddExerciseProps {
  newExercise: NewExercise;
  setNewExercise: (exercise: NewExercise) => void;
  onSaveNewExercise: () => Promise<void>;
  onBack: () => void;
}

export function AddExercise({ newExercise, setNewExercise, onSaveNewExercise, onBack }: AddExerciseProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>Add Exercise</ThemedText>
      </ThemedView>
      <ThemedView style={styles.formContainer}>
        <TextInput
          placeholder='Name'
          value={newExercise.name}
          onChangeText={text => setNewExercise({ ...newExercise, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder='Weight'
          keyboardType='numeric'
          value={newExercise.weight.toString()}
          onChangeText={text => setNewExercise({ ...newExercise, weight: text ? parseFloat(text) : 0 })}
          style={styles.input}
        />
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
      <ThemedView style={styles.formButtonContainer}>
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
  }
});
