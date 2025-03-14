import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface ViewWeeksProps {
  weeks: string[] | null;
  onSelectWeek: (week: string) => void;
}

export function ViewWeeks({ weeks, onSelectWeek }: ViewWeeksProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>History</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
        {weeks ? (
          weeks.map((week, index) => (
            <Button
              key={index}
              mode='contained'
              onPress={() => onSelectWeek(week)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {week}
            </Button>
          ))
        ) : (
          <ThemedText>No logs available</ThemedText>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  contentContainer: {
    gap: 20,
    marginTop: 20
  },
  button: {
    backgroundColor: '#1D6A47',
    paddingVertical: 5,
    borderRadius: 5
  },
  buttonLabel: {
    fontSize: 18
  },
});
