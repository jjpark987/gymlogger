import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

import { Exercise, Progress } from '@/database/types';
import { getExerciseProgress } from '@/database/log';
import { ExerciseProgress } from './ExerciseProgress';
import { UpdateExercise } from './UpdateExercise';


interface ExerciseDetailProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  progress: Progress | null;
  setProgress: (progress: Progress | null) => void;
  onSaveExercise: () => Promise<void>;
  onBack: () => void;
  onDeleteExercise: (exercise: Exercise) => Promise<void>;
}

export function ExerciseDetail({ exercise, setExercise, progress, setProgress, onSaveExercise, onBack, onDeleteExercise }: ExerciseDetailProps) {
  const [viewExercise, setViewExercise] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      async function fetchProgress() {
        const fetchedProgress = await getExerciseProgress(exercise);
        if (fetchedProgress) {
          setProgress(fetchedProgress);
        }
      }
      fetchProgress();
    }, [exercise])
  );

  function processLabels() {
    if (!progress || !progress.labels) return Array(5).fill('');
  
    const labels = ['', '', '', '', ''];
  
    progress.labels.forEach((label, index) => {
      if (label) {
        const [month, week] = label.split(' ');
        // console.log(month, week)
        if (week === 'W1') {
          labels[index] = month;
        }
      }
    });
  
    return labels;
  }

  function processDatasets() {
    if (!progress || !progress.datasets) return Array(5).fill(NaN); 
  
    const dataArrays = progress.datasets.map(dataset => {
      const data = dataset.data.map(value => value ?? NaN);
      return [...new Array(5 - data.length).fill(NaN), ...data];
    });
  
    return dataArrays;
  }

  function handleBack() {
    setViewExercise(false); 
    onBack();
  }

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{exercise.name}</ThemedText>
        <Switch
          value={viewExercise}
          onValueChange={() => setViewExercise(!viewExercise)}
          trackColor={{ true: '#1D3D6C' }}
        />
      </ThemedView>
      {viewExercise ? (
        <UpdateExercise
          exercise={exercise}
          setExercise={setExercise}
          onBack={handleBack}
          onSaveExercise={onSaveExercise}
          onDeleteExercise={onDeleteExercise}
        />
      ) : (
        <ExerciseProgress
          exercise={exercise}
          progress={progress}
          setChartLabels={processLabels}
          setChartDatasets={processDatasets}
          onBack={handleBack}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  }
});
