import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, DataTable } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { Exercise, Progress } from '@/database/types';

interface ExerciseProgressProps {
  exercise: Exercise;
  progress: Progress | null;
  onBack: () => void;
}

export function ExerciseProgress({ exercise, progress, onBack }: ExerciseProgressProps) {
  function processDatasets(progress: Progress): Progress {
    return {
      datasets: progress.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.map(point => ({
          ...point,
          label: point.label.includes('W1') ? point.label.split(' ')[0] : ''
        }))
      }))
    };
  }

  return (
    <>
      <ThemedView style={styles.container}>
        {progress ?
          <>
            {exercise.isOneArm && progress.datasets[1] ?
              <LineChart
                data={processDatasets(progress).datasets[0].data}
                lineSegments={progress.datasets[0].lineSegments}
                color='rgba(255, 255, 0, 0.7)'
                dataPointsColor='rgba(255, 255, 0, 0.7)'
                data2={processDatasets(progress).datasets[1].data}
                lineSegments2={progress.datasets[1].lineSegments}
                color2='rgba(255, 0, 0, 0.7)'
                dataPointsColor2='rgba(255, 0, 0, 0.7)'
                hideRules
                curved
                isAnimated
                initialSpacing={30}
                width={250}
                backgroundColor='transparent'
                xAxisColor='white'
                xAxisLabelTextStyle={{ color: 'white' }}
                yAxisColor='white'
                yAxisTextStyle={{ color: 'white' }}
                yAxisLabelContainerStyle={{ marginRight: 10 }}
                showFractionalValues={true}
                roundToDigits={0}
                noOfSections={5}
              />
              :
              <LineChart
                data={processDatasets(progress).datasets[0].data}
                lineSegments={progress.datasets[0].lineSegments}
                hideRules
                curved
                isAnimated
                initialSpacing={30}
                width={250}
                backgroundColor='transparent'
                color='orange'
                dataPointsColor='orange'
                xAxisColor='white'
                xAxisLabelTextStyle={{ color: 'white' }}
                yAxisColor='white'
                yAxisTextStyle={{ color: 'white' }}
                yAxisLabelContainerStyle={{ marginRight: 10 }}
                showFractionalValues={true}
                roundToDigits={0}
                noOfSections={5}
              />
            }
          </>
          :
          <ThemedText>No data available</ThemedText>
        }
        <Button
          mode='contained'
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        {progress &&
          <DataTable style={styles.tableContainer}>
            <DataTable.Header>
              <DataTable.Title textStyle={styles.tableText}>Week</DataTable.Title>
              {exercise.isOneArm ? 
                <>
                  <DataTable.Title numeric textStyle={styles.tableText}>Left Volume</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableText}>Right Volume</DataTable.Title>
                </>
               : 
                <DataTable.Title numeric textStyle={styles.tableText}>Volume</DataTable.Title>
              }
            </DataTable.Header>
            {progress.datasets[0].data.slice().reverse().map((point, i, reversedArray) => 
              <DataTable.Row key={i}>
                <DataTable.Cell textStyle={styles.tableText}>{point.label}</DataTable.Cell>
                {exercise.isOneArm ? 
                  <>
                    <DataTable.Cell numeric textStyle={styles.tableText}>
                      {reversedArray[i]?.value ?? '-'}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.tableText}>
                      {progress.datasets[1]?.data.slice().reverse()[i]?.value ?? '-'}
                    </DataTable.Cell>
                  </>
                 : 
                  <DataTable.Cell numeric textStyle={styles.tableText}>
                    {reversedArray[i]?.value ?? '-'}
                  </DataTable.Cell>
                }
              </DataTable.Row>
            )}
          </DataTable>
        }
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 50,
    marginVertical: 50
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
    height: 50
  }
});
