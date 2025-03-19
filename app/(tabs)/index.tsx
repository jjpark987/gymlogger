import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useDay } from '@/context/DayContext';
import { DayLogs, Exercise } from '@/database/types';
import { getExercisesByDay } from '@/database/exercise';
import { insertDayLogs } from '@/database/log';
import { ExerciseSelection } from '@/components/workoutTab/ExerciseSelection';
import { ExerciseLogging } from '@/components/workoutTab/ExerciseLogging';
import { RestDay } from '@/components/workoutTab/RestDay';

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

      AsyncStorage.setItem('dayLogs', JSON.stringify(updatedLogs));
  
      return updatedLogs;
    });
  }

  async function saveLogState() {
    if (!dayLogs) {
        console.log("⚠️ No logs to save. Exiting function.");
        return;
    }

    console.log("📝 Saving logs:", JSON.stringify(dayLogs, null, 2));

    try {
        console.log("📤 Inserting logs into database...");
        await insertDayLogs(dayLogs, exercises);
        console.log("✅ Logs successfully inserted into database.");
    } catch (error) {
        console.error("❌ Error inserting logs into database:", error);
        return;
    }

    try {
        console.log("🗑️ Removing saved logs from AsyncStorage...");
        await AsyncStorage.removeItem('dayLogs');
        console.log("✅ Logs removed from AsyncStorage.");
    } catch (error) {
        console.error("❌ Error removing logs from AsyncStorage:", error);
        return;
    }

    console.log("🔄 Resetting state: clearing `dayLogs`...");
    setDayLogs(null);
    console.log("✅ State reset complete.");
}

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<IconSymbol size={300} name='figure.strengthtraining.traditional' color='white' style={styles.background} />}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        {dayOfWeek.id === 5 || dayOfWeek.id === 6 ? (
          <RestDay day={dayOfWeek} />
        ) : selectedExercise ? (
          <ExerciseLogging
            selectedExercise={selectedExercise} 
            dayLogs={dayLogs ?? {}}
            onRepsChange={onRepsChange} 
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
