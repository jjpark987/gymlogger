import { Button, DataTable } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise, Progress } from '@/database/types';
import { Dimensions, StyleSheet } from 'react-native';

interface ExerciseProgressProps {
  exercise: Exercise;
  progress: Progress | null;
  setChartLabels: () => (string | null)[];
  setChartDatasets: () => { data: number[] | null[], color: () => string }[];  
  onBack: () => void;
}

export function ExerciseProgress({ exercise, progress, setChartLabels, setChartDatasets, onBack }: ExerciseProgressProps) {
  // console.log(progress)
  // console.log(progress?.datasets)
  // console.log(setChartLabels())
  // console.log(setChartDatasets())
  return (
    <>
      <ThemedView style={styles.contentContainer}>
        {progress ? (
          <>
            {/* <LineChart
              data={{
                labels: setChartLabels(),
                datasets: setChartDatasets()
              }}
              width={Dimensions.get('window').width}
              height={350}
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
              style={styles.lineChart}
            /> */}
            <DataTable style={styles.tableContainer}>
              <DataTable.Header>
                <DataTable.Title textStyle={styles.tableText}>Week</DataTable.Title>
                {exercise.isOneArm ? (
                  <>
                    <DataTable.Title numeric textStyle={styles.tableText}>Left Volume</DataTable.Title>
                    <DataTable.Title numeric textStyle={styles.tableText}>Right Volume</DataTable.Title>
                  </>
                ) : (
                  <DataTable.Title numeric textStyle={styles.tableText}>Volume</DataTable.Title>
                )}
              </DataTable.Header>
              {progress?.labels.slice().reverse().map((week, i) => (
                <DataTable.Row key={week}>
                  <DataTable.Cell textStyle={styles.tableText}>{week}</DataTable.Cell>
                  {exercise.isOneArm ? (
                    <>
                      <DataTable.Cell numeric textStyle={styles.tableText}>{progress.datasets[0].data[i] || '-'}</DataTable.Cell>
                      <DataTable.Cell numeric textStyle={styles.tableText}>{progress.datasets[1]?.data[i] || '-'}</DataTable.Cell>
                    </>
                  ) : (
                    <DataTable.Cell numeric textStyle={styles.tableText}>{progress.datasets[0].data[i] || '-'}</DataTable.Cell>
                  )}
                </DataTable.Row>
              ))}
            </DataTable>
          </>
        ) : (
          <>
            <ThemedText>No data available</ThemedText>
          </>
        )}
        <Button
          mode='contained'
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 50,
    marginTop: 50
  },
  lineChart: {
    alignSelf: 'center',
    paddingLeft: 50
  },
  tableContainer: {
    backgroundColor: 'transparent',
  },
  tableText: {
    color: 'white',
  },
  buttonLabel: {
    fontSize: 18
  },
  backButton: {
    backgroundColor: '#4A2C1D',
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
    marginBottom: 50
  }
});
