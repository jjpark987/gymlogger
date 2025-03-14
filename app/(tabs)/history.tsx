import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Day, Exercise, Log } from '@/database/types';
import { ViewWeeks } from '@/components/historyTab/ViewWeeks';
import { getLoggedDaysByWeek, getLoggedExercisesByDay, getLoggedWeeks } from '@/database/log';
import { ViewDays } from '@/components/historyTab/ViewDays';

export default function History() {
  const [weeks, setWeeks] = useState<(string[] | null)>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [days, setDays] = useState<(string | null)[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchWeeks() {
        const fetchedWeeks = await getLoggedWeeks();
        setWeeks(fetchedWeeks);
      }
      fetchWeeks();
      setSelectedExercise(null);
      setSelectedDay(null);
      setSelectedWeek(null);
    }, [])
  );

  async function fetchDays(week: string) {
    setSelectedWeek(week);
    const fetchedDays = await getLoggedDaysByWeek(week);
    setDays(fetchedDays);
  }
  
  async function fetchExercises(day: string) {
    setSelectedDay(day);
    const fetchedExercises = await getLoggedExercisesByDay(day);
    setExercises(fetchedExercises);
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D6A47' }} headerImage={<IconSymbol size={300} name='list.clipboard' color='white' style={styles.background} />}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        {/* intital page will show History as title and list as buttons each week. When pressing on a week, it will show the five days Monday thru Friday (title now dispalys the week (2/1/25 - 2/8/25)). When pressing on a day, it will show all four exercises (title now shows day and date (Monday 2/1/25)). When pressing on an exercise, it should show all logs for that exercise (title now appends the exercise name (Monday 2/1/25: DB Bicep Curl)). */}
        {selectedWeek ? (
          selectedDay ? (
            selectedExercise ? (
              // <ExerciseLogs exercise={selectedExercise} />
              <></>
            ) : (
              // <DayExercises day={selectedDay} onSelectExercise={setSelectedExercise} />
              <></>
            )
          ) : (
            <ViewDays 
              week={selectedWeek}
              days={days}
              onSelectDay={fetchExercises} 
            />
          )
        ) : (
          <ViewWeeks 
            weeks={weeks} 
            onSelectWeek={fetchDays} 
          />
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 20
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
