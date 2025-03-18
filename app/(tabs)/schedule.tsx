import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { getDays } from '@/database/day';
import { Day, Exercise, NewExercise, Progress } from '@/database/types';
import { destroyExercise, getExercisesByDay, insertExercise, updateExercise } from '@/database/exercise';
import { ScheduleOverview } from '@/components/scheduleTab/ScheduleOverview';
import { ExercisesOverview } from '@/components/scheduleTab/ExercisesOverview';
import { AddExercise } from '@/components/scheduleTab/AddExercise';
import { ExerciseDetail } from '@/components/scheduleTab/ExerciseDetail';
import { getExerciseProgress } from '@/database/log';

export default function Schedule() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [dayExercises, setDayExercises] = useState<(Exercise | null)[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: '',
    isOneArm: false,
    weight: 0,
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchDays() {
        const fetchedDays = await getDays();
        setDays(fetchedDays);
      }
      fetchDays();
      setProgress(null);
      setSelectedExercise(null);
      setSelectedSlot(null);
      setSelectedDay(null);
    }, [])
  );

  async function viewExercises(dayId: number) {
    setSelectedDay(days.find(d => d.id === dayId) || null);
    const exercises = await getExercisesByDay(dayId);
    setDayExercises(exercises);
  }

  async function viewExerciseDetails(exercise: Exercise) {
    setSelectedExercise(exercise);
    const progressData = await getExerciseProgress(exercise);
    console.log(progressData)
  }

  async function saveNewExercise() {
    if (!selectedDay) return;
    if (!selectedSlot) return;

    await insertExercise(selectedDay.id, newExercise.name, newExercise.isOneArm, newExercise.weight, selectedSlot);
    setNewExercise({
      name: '',
      isOneArm: false,
      weight: 0,
    });
    setSelectedSlot(null);
    setProgress(null);
    await viewExercises(selectedDay.id);
  }

  async function saveExercise() {
    if (!selectedExercise) return;
    if (!selectedDay) return;

    await updateExercise(selectedExercise.id, selectedExercise);
    setSelectedExercise(null);
    await viewExercises(selectedDay.id);
  }

  async function deleteExercise(selectedExercise: Exercise) {
    if (!selectedDay) return;

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete '${selectedExercise.name}'?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await destroyExercise(selectedExercise.id);
            setSelectedExercise(null);
            await viewExercises(selectedDay.id);
          }
        }
      ]
    );
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D6C' }} headerImage={<IconSymbol size={300} name='list.clipboard' color='white' style={styles.background} />}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        {selectedExercise ? (
          <ExerciseDetail
            exercise={selectedExercise}
            setExercise={setSelectedExercise}
            progress={progress}
            setProgress={setProgress}
            onSaveExercise={saveExercise}
            onBack={() => {
              setSelectedExercise(null);
              setProgress(null);
            }}            
            onDeleteExercise={() => deleteExercise(selectedExercise)}
          />
        ) : selectedSlot ? (
          <AddExercise
            newExercise={newExercise}
            setNewExercise={setNewExercise}
            onSaveNewExercise={saveNewExercise}
            onBack={() => setSelectedSlot(null)}
          />
        ) : selectedDay ? (
          <ExercisesOverview
            day={selectedDay}
            exercises={dayExercises}
            onSelectExercise={viewExerciseDetails}
            onSelectSlot={setSelectedSlot}
            onBack={() => setSelectedDay(null)}
          />
        ) : (
          <ScheduleOverview
            days={days}
            onSelectDay={viewExercises}
          />
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 20
  }
});
