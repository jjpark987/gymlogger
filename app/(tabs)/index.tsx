import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDay } from '@/context/DayContext';
import { DayLogs, Exercise } from '@/database/types';
import { getExercisesByDay } from '@/database/exercise';
import { insertDayLogs } from '@/database/log';
import { ExerciseSelection } from '@/components/workoutTab/ExerciseSelection';
import { ExerciseLogging } from '@/components/workoutTab/ExerciseLogging';
import { RestDay } from '@/components/workoutTab/RestDay';
import { Button } from 'react-native-paper';

export default function Workout() {
  const { dayOfWeek } = useDay();
  const [exercises, setExercises] = useState<(Exercise | null)[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dayLogs, setDayLogs] = useState<DayLogs | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchExercises() {
        const fetchedExercises = await getExercisesByDay(dayOfWeek.id);
        setExercises(fetchedExercises);
      }
      async function loadDayLogs() {
        const storedLogs = await AsyncStorage.getItem('dayLog');
        if (storedLogs) {
          setDayLogs(JSON.parse(storedLogs));
        }
      }
      fetchExercises();
      loadDayLogs();
      setSelectedExercise(null);
    }, [dayOfWeek.id])
  );

  function onRepsChange(exerciseId: number, setIndex: number, value: string, isLeft: boolean | null) {
    setDayLogs(prevLogs => {
      const updatedLogs = { ...prevLogs };

      if (!updatedLogs[exerciseId]) {
        updatedLogs[exerciseId] = { left: ['', '', '', ''], right: ['', '', '', ''] };
      }

      const newReps = value === '' ? '' : Number(value);

      if (isLeft === null) {
        updatedLogs[exerciseId].left = [...updatedLogs[exerciseId].left];
        updatedLogs[exerciseId].right = [...updatedLogs[exerciseId].right];

        updatedLogs[exerciseId].left[setIndex] = newReps;
        updatedLogs[exerciseId].right[setIndex] = newReps;
      } else if (isLeft) {
        updatedLogs[exerciseId].left = [...updatedLogs[exerciseId].left];
        updatedLogs[exerciseId].left[setIndex] = newReps;
      } else {
        updatedLogs[exerciseId].right = [...updatedLogs[exerciseId].right];
        updatedLogs[exerciseId].right[setIndex] = newReps;
      }

      AsyncStorage.setItem('dayLog', JSON.stringify(updatedLogs));

      return updatedLogs;
    });
  }

  async function saveLogState() {
    if (!dayLogs) return;

    await insertDayLogs(dayLogs);
    await AsyncStorage.removeItem('dayLog');
    setDayLogs(null);
  }

  return (
    <>
      {dayOfWeek.id === 5 || dayOfWeek.id === 6 ?
        <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<IconSymbol size={300} name='bed.double' color='white' style={styles.backgroundBed} />}>
          <RestDay day={dayOfWeek} />
        </ParallaxScrollView>
        :
        <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<IconSymbol size={300} name='figure.strengthtraining.traditional' color='white' style={styles.background} />}>
          <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
            {selectedExercise ?
              <ExerciseLogging
                selectedExercise={selectedExercise}
                dayLogs={dayLogs ?? {}}
                onRepsChange={onRepsChange}
                onBack={() => setSelectedExercise(null)}
              />
              :
              <ExerciseSelection
                day={dayOfWeek}
                exercises={exercises}
                onSelectExercise={setSelectedExercise}
              />
            }
            <Button 
              mode='contained'
              onPress={() => saveLogState()}
              style={{
                backgroundColor: 'white',
                paddingVertical: 5,
                borderRadius: 5,
                marginVertical: 50
              }}
              labelStyle={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: 20
              }}
            >
              Save
            </Button>
          </KeyboardAwareScrollView>
        </ParallaxScrollView>
      }
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 30
  },
  backgroundBed: {
    marginTop: 20
  }
});
