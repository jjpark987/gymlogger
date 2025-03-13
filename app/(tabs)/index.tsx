import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useCallback, useState } from 'react';
import { useDay } from '@/context/DayContext';
import { Exercise } from '@/database/types';
import { getExercisesByDay } from '@/database/exercise';

export default function Workout() {
  const { dayOfWeek } = useDay();
  const [exercises, setExercises] = useState<(Exercise | null)[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [setLogs, setSetLogs] = useState<{ [exerciseId: number]: { left: number[], right: number[] } }>({});

  useFocusEffect(
    useCallback(() => {
      async function fetchExercises() {
        const fetchedExercises = await getExercisesByDay(dayOfWeek.id);
        setExercises(fetchedExercises);
      }
      fetchExercises();
      setSelectedExercise(null);
    }, [dayOfWeek.id])
  );

  async function createLog(exercise: Exercise | null) {
    if (!exercise) {
      console.log('Schedule an exercise first');
      return;
    }
    setSelectedExercise(exercise);
  }

  function handleRepsChange(exerciseId: number, setIndex: number, value: string, isLeft: boolean | null) {
    setSetLogs((prevLogs) => {
      const updatedLogs = { ...prevLogs };
      const reps = [...(updatedLogs[exerciseId]?.[isLeft ? 'left' : 'right'] || [0, 0, 0, 0])];

      reps[setIndex] = value ? parseInt(value, 10) || 0 : 0;

      updatedLogs[exerciseId] = {
        left: isLeft !== false ? reps : updatedLogs[exerciseId]?.left || [0, 0, 0, 0],
        right: isLeft !== true ? reps : updatedLogs[exerciseId]?.right || [0, 0, 0, 0]
      };

      return updatedLogs;
    });
  }

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol size={300} name='figure.strengthtraining.traditional' color='white' style={styles.background} />
      }
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {dayOfWeek.id === 5 || dayOfWeek.id === 6 ? (
          <>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type='title'>{dayOfWeek.name}</ThemedText>
            </ThemedView>
            <ThemedText>REST DAY</ThemedText>
          </>
        ) : (
          selectedExercise ? (
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
                            value={setLogs[selectedExercise.id]?.left[index]?.toString() || ''}
                            onChangeText={(text) => handleRepsChange(selectedExercise.id, index, text, true)}
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
                            value={setLogs[selectedExercise.id]?.right[index]?.toString() || ''}
                            onChangeText={(text) => handleRepsChange(selectedExercise.id, index, text, false)}
                            style={styles.input}
                          />
                        ))}
                      </ThemedView>
                    </ThemedView>
                    <Button 
                      mode='contained'
                      onPress={() => setSelectedExercise(null)}
                      style={styles.button} 
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
                          value={setLogs[selectedExercise.id]?.right[index]?.toString() || ''}
                          onChangeText={(text) => handleRepsChange(selectedExercise.id, index, text, null)}
                          style={styles.input}
                        />
                      ))}
                    </ThemedView>
                    <Button 
                      mode='contained'
                      onPress={() => setSelectedExercise(null)}
                      style={styles.button} 
                      labelStyle={styles.buttonLabel}
                    >
                      Back
                    </Button>
                  </>
                )}
              </ThemedView>
            </>
          ) : (
            <>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>{dayOfWeek.name}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.contentContainer}>
                {exercises.map((exercise, index) => (
                  <Button 
                    key={index} 
                    mode='contained' 
                    onPress={() => createLog(exercise)} 
                    style={styles.button} 
                    labelStyle={styles.buttonLabel}
                  >
                    {exercise ? exercise.name : '-'}
                  </Button>
                ))}
              </ThemedView>
            </>
          )
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 30
  },
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
  button: {
    backgroundColor: '#1D3D47',
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
