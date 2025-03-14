import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Day } from '@/database/types';

interface ViewDaysProps {
  week: string;
  days: (string | null)[];
  onSelectDay: (day: string) => void;
}

export function ViewDays({ week, days, onSelectDay }: ViewDaysProps) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{week}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentContainer}>
        {days.length > 0 ? (
          days.map((day, index) => 
            day ? (
              <Button
                key={index}
                mode='contained'
                onPress={() => onSelectDay(day)}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                {day}
              </Button>
            ) : (
              <ThemedView key={index} style={styles.placeholderButton}>
                <ThemedText style={styles.placeholderText}>-</ThemedText>
              </ThemedView>
            )
          )
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
  placeholderButton: {
    backgroundColor: '#1D6A47', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18
  }
});
