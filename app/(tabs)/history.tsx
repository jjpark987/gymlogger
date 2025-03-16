import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { DayLogIds, Exercise, LoggedDay, LoggedWeek } from '@/database/types';
import { destroyLogs, getLoggedDaysByWeek, getLoggedExercisesByDay, getLoggedWeeks, getLogsByExercise, updateLogs } from '@/database/log';
import { ViewWeeks } from '@/components/historyTab/ViewWeeks';
import { ViewDays } from '@/components/historyTab/ViewDays';
import { ViewExercises } from '@/components/historyTab/ViewExercises';
import { ViewLogs } from '@/components/historyTab/ViewLogs';

export default function History() {
  const [weeks, setWeeks] = useState<LoggedWeek[] | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<LoggedWeek | null>(null);
  const [days, setDays] = useState<(LoggedDay | null)[]>([]);
  const [selectedDay, setSelectedDay] = useState<LoggedDay | null>(null);
  const [exercises, setExercises] = useState<(Exercise | null)[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dayLog, setDayLog] = useState<DayLogIds | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function viewWeeks() {
        const fetchedWeeks = await getLoggedWeeks();
        setWeeks(fetchedWeeks);
      }
      viewWeeks();
      setSelectedExercise(null);
      setSelectedDay(null);
      setSelectedWeek(null);
    }, [])
  );

  async function viewDays(week: LoggedWeek) {
    console.log(week)
    setSelectedWeek(week);
    const fetchedDays = await getLoggedDaysByWeek(week.startDate);
    setDays(fetchedDays);
    console.log(fetchedDays)
  }
  
  async function viewExercises(day: LoggedDay) {
    setSelectedDay(day);
    const fetchedExercises = await getLoggedExercisesByDay(day.date);
    setExercises(fetchedExercises);
  }

  async function viewLogs(day: LoggedDay, exercise: Exercise) {
    setSelectedExercise(exercise);
    const fetchedLogs = await getLogsByExercise(day.date, exercise);
    setDayLog(fetchedLogs);
  }

  function onRepsChange(index: number, text: string, isLeft: boolean | null) {
    if (!dayLog) return;
  
    const updatedLog = { 
      left: dayLog.left.map((log, i) => 
        i === index && isLeft === true ? { ...log, reps: text ? parseInt(text, 10) || 0 : 0 } : log
      ),
      right: dayLog.right.map((log, i) => 
        i === index && isLeft !== true ? { ...log, reps: text ? parseInt(text, 10) || 0 : 0 } : log
      ),
    };
  
    setDayLog(updatedLog);
  }

  async function saveLog(updatedDayLog: DayLogIds | null) {
    if (!updatedDayLog) return;

    await updateLogs(updatedDayLog);
    setSelectedExercise(null);
  }

  async function deleteLog(dayLog: DayLogIds | null) {
    if (!dayLog) return;
    if (!selectedDay) return;
  
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete this log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await destroyLogs(dayLog);
            setSelectedExercise(null);
            await viewExercises(selectedDay);
          }
        }
      ]
    );
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D6A47' }} headerImage={<IconSymbol size={300} name='clock.badge.questionmark' color='white' style={styles.background} />}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        {selectedWeek ? (
          selectedDay ? (
            selectedExercise ? (
              <ViewLogs
                exercise={selectedExercise} 
                dayLog={dayLog}
                onRepsChange={onRepsChange}
                onSaveLog={saveLog}
                onBack={() => setSelectedExercise(null)}
                onDeleteLog={deleteLog}
              />
            ) : (
              <ViewExercises 
                week={selectedWeek}
                day={selectedDay} 
                exercises={exercises}
                onSelectExercise={viewLogs} 
                onBack={() => setSelectedDay(null)}
              />
            )
          ) : (
            <ViewDays 
              week={selectedWeek}
              days={days}
              onSelectDay={viewExercises}
              onBack={() => setSelectedWeek(null)}
            />
          )
        ) : (
          <ViewWeeks 
            weeks={weeks} 
            onSelectWeek={viewDays} 
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
