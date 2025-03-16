import { Dimensions, StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';

import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise } from '@/database/types';
import { LineChart } from 'react-native-chart-kit';


interface ExerciseDetailProps {
  exercise: Exercise;
  setExercise: (updatedExercise: Exercise) => void;
  progressData: any | null;
  onSaveExercise: () => Promise<void>;
  onBack: () => void;
  onDeleteExercise: (exercise: Exercise) => Promise<void>;
}

export function ExerciseDetail({ exercise, setExercise, progressData, onSaveExercise, onBack, onDeleteExercise }: ExerciseDetailProps) {
  console.log(progressData)
  const data = {
    labels: ['', 'March', '', '', ''],
    datasets: [
      {
        data: [3000, 3100, 3100, 3020, 3120],
        color: () => `rgb(255, 255, 255)`,
        strokeWidth: 4
      }
    ]
  };
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{exercise.name}</ThemedText>
      </ThemedView>
      {/* <ThemedView>
        <ThemedText type='title' style={styles.chartTitle}>{exercise.weight} lbs</ThemedText>
        <LineChart
          data={data}
          width={Dimensions.get('window').width} 
          height={300}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#121212', 
            backgroundGradientFrom: '#121212',
            backgroundGradientTo: '#121212',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          bezier
          withShadow={false}
          style={{
            marginVertical: 8,
            alignSelf: 'center',
            paddingTop: 20
          }}
        />
      </ThemedView> */}

      <ThemedView style={styles.contentContainer}>
        <TextInput
          placeholder='Name'
          value={exercise.name}
          onChangeText={text => setExercise({ ...exercise, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder='Weight'
          keyboardType='numeric'
          value={exercise.weight.toString()}
          onChangeText={text => setExercise({ ...exercise, weight: parseFloat(text) || 0 })}
          style={styles.input}
        />
        <ThemedView>
          <ThemedText>Is One Arm?</ThemedText>
          <Switch
            value={!!exercise.isOneArm}
            onValueChange={value => setExercise({ ...exercise, isOneArm: value })}
            trackColor={{ true: '#1D3D6C' }}
            style={styles.switch}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          mode='contained'
          onPress={onSaveExercise}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save
        </Button>
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
          onPress={() => onDeleteExercise(exercise)}
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  contentContainer: {
    gap: 20,
    marginTop: 20
  },
  chartTitle: {
    marginTop: 20
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 18
  },
  switch: {
    transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }],
    marginTop: 10,
    marginLeft: 10
  },
  buttonContainer: {
    gap: 30,
    marginTop: 30
  },
  button: {
    backgroundColor: '#1D3D6C',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  buttonLabel: {
    fontSize: 18
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  delButton: {
    backgroundColor: '#6C1D1D',
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 50,
    marginBottom: 50,
    height: 50,
  }
});
