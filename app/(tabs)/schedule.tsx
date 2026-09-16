import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router/react-navigation";
import { useCallback, useState } from "react";
import { Alert, DevSettings, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "react-native-paper";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { resetDatabase } from "@/database/database";
import { getDays } from "@/database/day";
import { Day, Exercise, InputExercise, Progress } from "@/database/types";
import {
  destroyExercise,
  getExercisesByDay,
  insertExercise,
  updateExercise,
} from "@/database/exercise";
import { getExerciseProgress } from "@/database/log";
import { ScheduleOverview } from "@/components/scheduleTab/ScheduleOverview";
import { ExercisesOverview } from "@/components/scheduleTab/ExercisesOverview";
import { AddExercise } from "@/components/scheduleTab/AddExercise";
import { ExerciseDetail } from "@/components/scheduleTab/ExerciseDetail";
import { setupDatabase } from "@/database/setup";

export default function Schedule() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [dayExercises, setDayExercises] = useState<(Exercise | null)[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [newExercise, setNewExercise] = useState<InputExercise>({
    name: "",
    isOneArm: false,
    weight: "",
    increment: "",
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [updatedExercise, setUpdatedExercise] = useState<InputExercise | null>(
    null,
  );
  const [progress, setProgress] = useState<Progress | null>(null);
  const [savingExercise, setSavingExercise] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function fetchDays() {
        const fetchedDays = await getDays();
        setDays(fetchedDays);
      }
      fetchDays();
      setProgress(null);
      setUpdatedExercise(null);
      setSelectedExercise(null);
      setNewExercise({
        name: "",
        isOneArm: false,
        weight: "",
        increment: "",
      });
      setSelectedSlot(null);
      setSelectedDay(null);
    }, []),
  );

  async function viewExercises(dayId: number) {
    setSelectedDay(days.find((d) => d.id === dayId) || null);
    const exercises = await getExercisesByDay(dayId);
    setDayExercises(exercises);
  }

  async function viewExerciseDetails(exercise: Exercise) {
    setSelectedExercise(exercise);
    setUpdatedExercise({
      name: exercise.name,
      isOneArm: exercise.isOneArm,
      weight: exercise.weight.toString(),
      increment: exercise.increment.toString(),
    });
    const progressData = await getExerciseProgress(exercise);
    setProgress(progressData);
  }

  async function saveNewExercise() {
    if (!selectedDay) return;
    if (selectedSlot === null || savingExercise) return;

    const name = newExercise.name.trim();
    const weight = Number(newExercise.weight);
    const increment = Number(newExercise.increment);
    if (
      !name ||
      newExercise.weight.trim() === "" ||
      newExercise.increment.trim() === "" ||
      !Number.isFinite(weight) ||
      !Number.isFinite(increment) ||
      weight < 0 ||
      increment < 0
    ) {
      Alert.alert(
        "Invalid Exercise",
        "Enter a name and non-negative weight and increment values.",
      );
      return;
    }

    setSavingExercise(true);
    try {
      await insertExercise(
        selectedDay.id,
        name,
        newExercise.isOneArm,
        weight,
        increment,
        selectedSlot,
      );
      setNewExercise({
        name: "",
        isOneArm: false,
        weight: "",
        increment: "",
      });
      setSelectedSlot(null);
      setProgress(null);
      await viewExercises(selectedDay.id);
    } finally {
      setSavingExercise(false);
    }
  }

  async function saveExercise() {
    if (!updatedExercise) return;
    if (!selectedExercise) return;
    if (!selectedDay) return;
    if (savingExercise) return;

    const name = updatedExercise.name.trim();
    const weight = Number(updatedExercise.weight);
    const increment = Number(updatedExercise.increment);
    if (
      !name ||
      updatedExercise.weight.trim() === "" ||
      updatedExercise.increment.trim() === "" ||
      !Number.isFinite(weight) ||
      !Number.isFinite(increment) ||
      weight < 0 ||
      increment < 0
    ) {
      Alert.alert(
        "Invalid Exercise",
        "Enter a name and non-negative weight and increment values.",
      );
      return;
    }

    const exercise: Exercise = {
      ...updatedExercise,
      name,
      id: selectedExercise.id,
      dayId: selectedExercise.dayId,
      weight,
      increment,
      orderNum: selectedExercise.orderNum,
    };

    setSavingExercise(true);
    try {
      await updateExercise(selectedExercise.id, exercise);
      setSelectedExercise(null);
      await viewExercises(selectedDay.id);
    } finally {
      setSavingExercise(false);
    }
  }

  async function deleteExercise(selectedExercise: Exercise) {
    if (!selectedDay) return;

    Alert.alert(
      "Confirm Deletion",
      `Delete '${selectedExercise.name}' and all of its workout history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSavingExercise(true);
            try {
              await destroyExercise(selectedExercise.id);
              setSelectedExercise(null);
              await viewExercises(selectedDay.id);
            } finally {
              setSavingExercise(false);
            }
          },
        },
      ],
    );
  }

  async function resetLocalDatabase() {
    try {
      await AsyncStorage.removeItem("dayLog");
      await resetDatabase();
      await setupDatabase();
      DevSettings.reload();
    } catch (error) {
      console.error("Error resetting local database:", error);
      Alert.alert("Reset Failed", "Local database reset did not complete.");
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D6C" }}
      headerImage={
        <IconSymbol
          size={300}
          name="list.clipboard"
          color="white"
          style={styles.background}
        />
      }
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {selectedDay ? (
          selectedSlot ? (
            <AddExercise
              newExercise={newExercise}
              setNewExercise={setNewExercise}
              onSaveNewExercise={saveNewExercise}
              saving={savingExercise}
              onBack={() => {
                setSelectedSlot(null);
                setNewExercise({
                  name: "",
                  isOneArm: false,
                  weight: "",
                  increment: "",
                });
              }}
            />
          ) : selectedExercise ? (
            <ExerciseDetail
              exercise={selectedExercise}
              updatedExercise={updatedExercise}
              setUpdatedExercise={setUpdatedExercise}
              progress={progress}
              setProgress={setProgress}
              onSaveExercise={saveExercise}
              onBack={() => {
                setSelectedExercise(null);
                setUpdatedExercise(null);
                setProgress(null);
              }}
              onDeleteExercise={() => deleteExercise(selectedExercise)}
              saving={savingExercise}
            />
          ) : (
            <ExercisesOverview
              day={selectedDay}
              exercises={dayExercises}
              onSelectExercise={viewExerciseDetails}
              onSelectSlot={setSelectedSlot}
              onBack={() => setSelectedDay(null)}
              onRefresh={async () => {
                const updated = await getExercisesByDay(selectedDay.id);
                setDayExercises(updated);
              }}
            />
          )
        ) : (
          <>
            <ScheduleOverview days={days} onSelectDay={viewExercises} />
            {__DEV__ ? (
              <Button
                mode="contained"
                onPress={() =>
                  Alert.alert(
                    "Reset Database",
                    "Delete all local schedule and log data?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Reset",
                        style: "destructive",
                        onPress: async () => {
                          await resetLocalDatabase();
                        },
                      },
                    ],
                  )
                }
                style={styles.resetButton}
                labelStyle={styles.resetButtonLabel}
              >
                Reset DB
              </Button>
            ) : null}
          </>
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: "#6C1D1D",
    paddingVertical: 5,
    borderRadius: 5,
    marginVertical: 50,
  },
  resetButtonLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
});
