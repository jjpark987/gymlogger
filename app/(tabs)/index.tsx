import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router/react-navigation";
import { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "react-native-paper";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ExerciseLogging } from "@/components/workoutTab/ExerciseLogging";
import { ExerciseSelection } from "@/components/workoutTab/ExerciseSelection";
import { RestDay } from "@/components/workoutTab/RestDay";
import { useDay } from "@/context/DayContext";
import { getExercisesByDay } from "@/database/exercise";
import { insertDayLogs } from "@/database/log";
import { DayLogs, Exercise, WorkoutDraft } from "@/database/types";

function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function Workout() {
  const { dayOfWeek, isDateRest } = useDay();
  const [exercises, setExercises] = useState<(Exercise | null)[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [dayLogs, setDayLogs] = useState<DayLogs | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      async function fetchExercises() {
        const fetchedExercises = await getExercisesByDay(dayOfWeek.id);
        setExercises(fetchedExercises);
      }
      async function loadDayLogs() {
        const storedLogs = await AsyncStorage.getItem("dayLog");
        if (!storedLogs) {
          setDayLogs(null);
          return;
        }

        const draft = JSON.parse(storedLogs) as WorkoutDraft;
        if (
          draft.date === getLocalDateKey() &&
          draft.dayId === dayOfWeek.id &&
          draft.logs
        ) {
          setDayLogs(draft.logs);
        } else {
          await AsyncStorage.removeItem("dayLog");
          setDayLogs(null);
        }
      }
      fetchExercises();
      loadDayLogs();
      setSelectedExercise(null);
    }, [dayOfWeek.id]),
  );

  function onRepsChange(
    exerciseId: number,
    setIndex: number,
    value: string,
    isLeft: boolean | null,
  ) {
    setDayLogs((prevLogs) => {
      const updatedLogs = { ...prevLogs };

      if (!updatedLogs[exerciseId]) {
        updatedLogs[exerciseId] = {
          left: ["", "", ""],
          right: ["", "", ""],
        };
      }

      const newReps = value === "" ? "" : Number(value);

      if (isLeft === null) {
        updatedLogs[exerciseId].left = [...updatedLogs[exerciseId].left];
        updatedLogs[exerciseId].right = [...updatedLogs[exerciseId].right];

        updatedLogs[exerciseId].left[setIndex] = newReps;
        updatedLogs[exerciseId].right[setIndex] = newReps;
      } else if (isLeft) {
        updatedLogs[exerciseId].left = [...updatedLogs[exerciseId].left];
        updatedLogs[exerciseId].left[setIndex] = newReps;
      } else {
        updatedLogs[exerciseId].right = [...updatedLogs[exerciseId].right];
        updatedLogs[exerciseId].right[setIndex] = newReps;
      }

      const draft: WorkoutDraft = {
        date: getLocalDateKey(),
        dayId: dayOfWeek.id,
        logs: updatedLogs,
      };
      void AsyncStorage.setItem("dayLog", JSON.stringify(draft));

      return updatedLogs;
    });
  }

  async function saveLogState() {
    if (!dayLogs || savingRef.current) return;

    const exerciseById = new Map(
      exercises
        .filter((exercise): exercise is Exercise => exercise !== null)
        .map((exercise) => [exercise.id, exercise]),
    );
    const touchedLogs: DayLogs = {};

    for (const [exerciseId, log] of Object.entries(dayLogs)) {
      const exercise = exerciseById.get(Number(exerciseId));
      if (!exercise) {
        Alert.alert(
          "Workout Changed",
          "An exercise in this draft no longer exists. Review the workout before saving.",
        );
        return;
      }

      const applicableSets = exercise.isOneArm
        ? [...log.left, ...log.right]
        : log.right;
      if (!applicableSets.some((set) => set !== "")) continue;

      if (
        applicableSets.length !== (exercise.isOneArm ? 6 : 3) ||
        applicableSets.some((set) => set === "")
      ) {
        Alert.alert(
          "Incomplete Exercise",
          `Complete every set for ${exercise.name} before saving.`,
        );
        return;
      }

      touchedLogs[Number(exerciseId)] = log;
    }

    if (Object.keys(touchedLogs).length === 0) {
      Alert.alert("Nothing to Save", "Enter reps for at least one exercise.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      await insertDayLogs(touchedLogs);
      await AsyncStorage.removeItem("dayLog");
      setDayLogs(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert(
        "Save Failed",
        "The workout was not saved. Your draft remains.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      {isDateRest(new Date()) ? (
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
          headerImage={
            <IconSymbol
              size={300}
              name="bed.double"
              color="white"
              style={styles.backgroundBed}
            />
          }
        >
          <RestDay day={dayOfWeek} />
        </ParallaxScrollView>
      ) : (
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
          headerImage={
            <IconSymbol
              size={300}
              name="figure.strengthtraining.traditional"
              color="white"
              style={styles.background}
            />
          }
        >
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {selectedExercise ? (
              <ExerciseLogging
                selectedExercise={selectedExercise}
                dayLogs={dayLogs ?? {}}
                onRepsChange={onRepsChange}
                onBack={() => setSelectedExercise(null)}
              />
            ) : (
              <ExerciseSelection
                day={dayOfWeek}
                exercises={exercises}
                onSelectExercise={setSelectedExercise}
              />
            )}
            <Button
              mode="contained"
              onPress={saveLogState}
              disabled={saving}
              loading={saving}
              style={{
                backgroundColor: "white",
                paddingVertical: 5,
                borderRadius: 5,
                marginVertical: 50,
              }}
              labelStyle={{
                color: "black",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              {saving ? "Saving" : "Save"}
            </Button>
          </KeyboardAwareScrollView>
        </ParallaxScrollView>
      )}
      {showConfetti && <ConfettiCannon count={100} origin={{ x: -10, y: 0 }} />}
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 30,
  },
  backgroundBed: {
    marginTop: 20,
  },
});
