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
          onBack={async () => {
            setViewExercise(false);
            onBack();
          }}
          onSaveExercise={onSaveExercise}
          onDeleteExercise={onDeleteExercise}
        />
      ) : (
        <ExerciseProgress
          exercise={exercise}
          progress={progress}
          onBack={async () => {
            setViewExercise(false);
            onBack();
          }}
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
