import { StyleSheet } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Exercise } from '@/database/types';

interface ExerciseDetailProps {
  exercise: Exercise;
  setExercise: (updatedExercise: Exercise) => void;
  onSaveExercise: () => Promise<void>;
  onBack: () => void;
}

export function ViewLogs({ onSelectWeek }: { onSelectWeek: string }) {
  return (<></>);
}
