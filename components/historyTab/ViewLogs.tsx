import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { DayLogIds, Exercise, } from '@/database/types';

interface ViewLogsProps {
  exercise: Exercise;
  dayLog: DayLogIds | null;
  onRepsChange: (index: number, text: string, isLeft: (boolean | null)) => void;
  onSaveLog: (updatedDayLog: DayLogIds | null) => Promise<void>;
  onBack: () => void;
  onDeleteLog: (dayLog: DayLogIds | null) => Promise<void>;
}

export function ViewLogs({ exercise, dayLog, onRepsChange, onSaveLog, onBack, onDeleteLog }: ViewLogsProps) {
  return (
    <>
      <ThemedText type='title'>{exercise.name}</ThemedText>
      {dayLog && (
        exercise.isOneArm ?
          <ThemedView style={styles.oneArmLogger}>
            <ThemedView style={styles.oneArmLoggerCol}>
              {dayLog.left.map((_, index) =>
                <TextInput
                  key={`l${index}`}
                  placeholder={`Set ${index + 1}`}
                  keyboardType='numeric'
                  value={dayLog.left[index].reps?.toString()}
                  onChangeText={text => onRepsChange(index, text, true)}
                  style={styles.input}
                />
              )}
            </ThemedView>
            <ThemedView style={styles.oneArmLoggerCol}>
              {dayLog.right.map((_, index) =>
                <TextInput
                  key={`r${index}`}
                  placeholder={`Set ${index + 1}`}
                  keyboardType='numeric'
                  value={dayLog.right[index].reps?.toString()}
                  onChangeText={text => onRepsChange(index, text, false)}
                  style={styles.input}
                />
              )}
            </ThemedView>
          </ThemedView>
          :
          <ThemedView style={styles.twoArmLogger}>
            {dayLog.right.map((_, index) =>
              <TextInput
                key={`set${index}`}
                placeholder={`Set ${index + 1}`}
                keyboardType='numeric'
                value={dayLog.right[index].reps?.toString()}
                onChangeText={text => onRepsChange(index, text, null)}
                style={styles.input}
              />
            )}
          </ThemedView>
      )}
      <ThemedView style={styles.buttonContainer}>
        <Button
          mode='contained'
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        <Button
          mode='contained'
          onPress={() => onSaveLog(dayLog)}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save
        </Button>
        <Button
          mode='contained'
          onPress={() => onDeleteLog(dayLog)}
          style={styles.delButton}
          labelStyle={styles.buttonLabel}
        >
          Delete
        </Button>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  oneArmLogger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  oneArmLoggerCol: {
    width: '48%',
    gap: 20
  },
  twoArmLogger: {
    gap: 20,
    marginTop: 20
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18,
  },
  buttonContainer: {
    gap: 20,
    marginTop: 40
  },
  buttonLabel: {
    fontSize: 18
  },
  button: {
    backgroundColor: '#1D6A47',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 50,
    height: 50,
  },
  delButton: {
    backgroundColor: '#6C1D1D',
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 50,
    height: 50,
  },
});
