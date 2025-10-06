import { useCallback, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect } from "@react-navigation/native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
    if (!selectedSlot) return;

    if (
      newExercise.name === "" ||
      newExercise.weight === "" ||
      newExercise.increment === ""
    ) {
      Alert.alert("Missing Fields", "Enter name, weight, and increment.", [
        { text: "Cancel", style: "cancel" },
      ]);
    }

    await insertExercise(
      selectedDay.id,
      newExercise.name,
      newExercise.isOneArm,
      parseFloat(newExercise.weight),
      parseFloat(newExercise.increment),
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
  }

  async function saveExercise() {
    if (!updatedExercise) return;
    if (!selectedExercise) return;
    if (!selectedDay) return;

    const exercise: Exercise = {
      ...updatedExercise,
      id: selectedExercise.id,
      dayId: selectedExercise.dayId,
      weight: parseFloat(updatedExercise?.weight),
      increment: parseFloat(updatedExercise?.increment),
      orderNum: selectedExercise.orderNum,
    };

    await updateExercise(selectedExercise.id, exercise);
    setSelectedExercise(null);
    await viewExercises(selectedDay.id);
  }

  async function deleteExercise(selectedExercise: Exercise) {
    if (!selectedDay) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete '${selectedExercise.name}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await destroyExercise(selectedExercise.id);
            setSelectedExercise(null);
            await viewExercises(selectedDay.id);
          },
        },
      ],
    );
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
          <ScheduleOverview days={days} onSelectDay={viewExercises} />
        )}
      </KeyboardAwareScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 20,
  },
});
