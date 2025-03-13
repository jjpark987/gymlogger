import { StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useCallback, useState } from 'react';
import { getDays } from '@/database/day';
import { Day, Exercise } from '@/database/types';
import { getExercisesByDay, insertExercise } from '@/database/exercise';

export default function Schedule() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [exercises, setExercises] = useState<(Exercise | null)[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseIsOneArm, setExerciseIsOneArm] = useState<boolean>(false);
  const [exerciseWeight, setExerciseWeight] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      async function fetchDays() {
        const fetchedDays = await getDays();
        setDays(fetchedDays);
      }
      fetchDays();
      setSelectedOrder(null);
      setSelectedDay(null);
    }, [])
  );

  async function viewExercises(dayId: number) {
    setSelectedDay(days.find(d => d.id === dayId) || null);
    const exercisesByDay = await getExercisesByDay(dayId);
    setExercises(exercisesByDay);
  }

  async function saveExercise() {
    if (!selectedDay) {
      console.error('No day selected');
      return;
    }
    if (!selectedOrder) {
      console.error('No order selected');
      return;
    }
    await insertExercise(selectedDay.id, exerciseName, exerciseIsOneArm, exerciseWeight, selectedOrder);
    setExerciseName(''); 
    setExerciseIsOneArm(false);
    setExerciseWeight(0);
    setSelectedOrder(null);
    viewExercises(selectedDay.id);
  }

  async function viewExerciseDetails() {
    // Shows a line graph and table if logs exist
    // Can edit name, weight, is one arm and save
    // Can delete this exercise from this day slot
    console.log('VIEW EXERCISE DETAILS')
  }

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D6C' }}
      headerImage={
        <IconSymbol size={300} name='list.clipboard' color='white' style={styles.background} />
      }
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {selectedOrder ? (
          <>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type='title'>Add Exercise</ThemedText>
            </ThemedView>
            <ThemedView style={styles.formContainer}>
              <TextInput
                placeholder='Name'
                value={exerciseName || ''}
                onChangeText={text => setExerciseName(text)}
                style={styles.input}
              />
              <TextInput
                placeholder='Weight'
                keyboardType='numeric'
                value={exerciseWeight.toString()}
                onChangeText={text => setExerciseWeight(parseFloat(text) || 0)}
                style={styles.input}
              />
              <ThemedView>
                <ThemedText>Is One Arm?</ThemedText>
                <Switch
                  value={exerciseIsOneArm} 
                  onValueChange={value => setExerciseIsOneArm(value)}
                  trackColor={{ true: '#1D3D6C' }}
                  style={styles.switch}
                />
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.formButtonContainer}>
              <Button
                mode='contained'
                onPress={saveExercise}
                style={styles.button} 
                labelStyle={styles.buttonLabel}
              >
                Save
              </Button>
              <Button 
                mode='contained'
                onPress={() => setSelectedOrder(null)}
                style={styles.button} 
                labelStyle={styles.buttonLabel}
              >
                Cancel
              </Button>
            </ThemedView>
          </>
        ) : (
          selectedDay ? (
            <>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>{selectedDay.name}</ThemedText>
              </ThemedView>        
              <ThemedView style={styles.contentContainer}>
                {exercises.map((exercise, index) => (
                  exercise ? (
                    <Button 
                      key={index} 
                      mode='contained' 
                      onPress={viewExerciseDetails} 
                      style={styles.button} 
                      labelStyle={styles.buttonLabel}
                    >
                      {exercise.name}
                    </Button>
                  ) : (
                    <Button 
                      key={index} 
                      mode='contained' 
                      onPress={() => setSelectedOrder(index + 1)} 
                      style={styles.button} 
                      labelStyle={styles.buttonLabel}
                    >
                      +
                    </Button>
                  )
                ))}
              <Button 
                mode='contained'
                onPress={() => setSelectedDay(null)}
                style={styles.button} 
                labelStyle={styles.buttonLabel}
              >
                Back
              </Button>
              </ThemedView>
            </>
          ) : (
            <>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>Schedule</ThemedText>
              </ThemedView>
              <ThemedView style={styles.contentContainer}>
                {days.map(day => (
                  <Button 
                    key={day.id} 
                    mode='contained' 
                    onPress={() => viewExercises(day.id)}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                  >
                    {day.name}
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
    marginTop: 20
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
    gap: 10,
    marginTop: 20
  },
  formButtonContainer: {
    gap: 20
  },
  button: {
    backgroundColor: '#1D3D6C',
    paddingVertical: 5,
    borderRadius: 5
  },
  buttonLabel: {
    fontSize: 18
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
  }
});
