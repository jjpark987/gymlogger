import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { Day } from '@/database/types';

interface ScheduleOverviewProps {
  days: Day[];
  onSelectDay: (dayId: number) => Promise<void>;
}

export function ScheduleOverview({ days, onSelectDay }: ScheduleOverviewProps) {
  return (
    <>
      <ThemedText type='title'>Schedule</ThemedText>
      <ThemedView style={styles.container}>
        {days.map(day =>
          <Button
            key={day.id}
            mode='contained'
            onPress={() => onSelectDay(day.id)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {day.name}
          </Button>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 30,
    marginTop: 20
  },
  buttonLabel: {
    fontSize: 18
  },
  button: {
    backgroundColor: '#1D3D6C',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  }
});
