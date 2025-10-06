import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { Switch } from "react-native-paper";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

import { getExerciseProgress } from "@/database/log";
import { Exercise, InputExercise, Progress } from "@/database/types";
import { ExerciseProgress } from "./ExerciseProgress";
import { UpdateExercise } from "./UpdateExercise";

interface ExerciseDetailProps {
  exercise: Exercise;
  updatedExercise: InputExercise | null;
  setUpdatedExercise: (exercise: InputExercise) => void;
  progress: Progress | null;
  setProgress: (progress: Progress | null) => void;
  onSaveExercise: () => Promise<void>;
  onBack: () => void;
  onDeleteExercise: () => Promise<void>;
}

export function ExerciseDetail({
  exercise,
  updatedExercise,
  setUpdatedExercise,
  progress,
  setProgress,
  onSaveExercise,
  onBack,
  onDeleteExercise,
}: ExerciseDetailProps) {
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
    }, [exercise, setProgress]),
  );

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={styles.titleText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {exercise.name}
        </ThemedText>
        <Switch
          value={viewExercise}
          onValueChange={() => setViewExercise(!viewExercise)}
          trackColor={{ true: "#1D3D6C" }}
        />
      </ThemedView>
      {viewExercise ? (
        <UpdateExercise
          updatedExercise={
            updatedExercise ?? {
              name: "",
              isOneArm: false,
              weight: "",
              increment: "",
            }
          }
          setUpdatedExercise={setUpdatedExercise}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
  },
  titleText: {
    flexShrink: 1,
  },
});
