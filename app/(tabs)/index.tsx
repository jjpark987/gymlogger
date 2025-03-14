import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useCallback, useState } from 'react';
import { useDay } from '@/context/DayContext';
import { DayLogs, Exercise } from '@/database/types';
import { getExercisesByDay } from '@/database/exercise';
import { ExerciseSelection } from '@/components/workoutTab/ExerciseSelection';
import { ExerciseLogging } from '@/components/workoutTab/ExerciseLogging';
import { RestDay } from '@/components/workoutTab/RestDay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertDayLogs } from '@/database/log';

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
        const storedLogs = await AsyncStorage.getItem('dayLogs');
        if (storedLogs) {
          setDayLogs(JSON.parse(storedLogs));
        }
      }
      fetchExercises();
      loadDayLogs();
      setSelectedExercise(null);
    }, [dayOfWeek.id])
  );

  function updateLogState(exerciseId: number, setIndex: number, value: string, isLeft: boolean | null) {
    setDayLogs(prevLogs => {
      const updatedLogs = { ...prevLogs };
      const reps = [...(updatedLogs[exerciseId]?.[isLeft ? 'left' : 'right'] || [0, 0, 0, 0])];
      reps[setIndex] = value ? parseInt(value, 10) || 0 : 0;
      updatedLogs[exerciseId] = {
        left: isLeft !== false ? reps : updatedLogs[exerciseId]?.left || [0, 0, 0, 0],
        right: isLeft !== true ? reps : updatedLogs[exerciseId]?.right || [0, 0, 0, 0]
      };
  
      AsyncStorage.setItem('dayLogs', JSON.stringify(updatedLogs));
  
      return updatedLogs;
    });
  }

  async function saveLogState() {
    if (!dayLogs) {
      console.log('No daylogs selected');
      return;
    }
    await insertDayLogs(dayLogs, exercises);
    setDayLogs(null);
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<IconSymbol size={300} name='list.clipboard' color='white' style={styles.background} />}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        {dayOfWeek.id === 5 || dayOfWeek.id === 6 ? (
          <RestDay day={dayOfWeek} />
        ) : selectedExercise ? (
          <ExerciseLogging
            selectedExercise={selectedExercise} 
            dayLogs={dayLogs ?? {}}
            onRepsChange={updateLogState} 
            onBack={() => setSelectedExercise(null)}
          />
        ) : (
          <ExerciseSelection
            day={dayOfWeek} 
            exercises={exercises} 
            onSelectExercise={setSelectedExercise} 
            onSaveLogs={saveLogState}
          />
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 30
  }
});
