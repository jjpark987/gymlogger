import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { LoggedWeek } from '@/database/types';

interface ViewWeeksProps {
  weeks: LoggedWeek[] | null;
  onSelectWeek: (week: LoggedWeek) => void;
}

export function ViewWeeks({ weeks, onSelectWeek }: ViewWeeksProps) {
  return (
    <>
      <ThemedText type='title'>History</ThemedText>
      <ThemedView style={styles.container}>
        {weeks ?
          weeks.map((week, index) =>
            <Button
              key={index}
              mode='contained'
              onPress={() => onSelectWeek(week)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {week.display}
            </Button>
          )
          :
          <ThemedText>No logs available</ThemedText>
        }
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 20
  },
  buttonLabel: {
    fontSize: 18
  },
  button: {
    backgroundColor: '#1D6A47',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  }
});
