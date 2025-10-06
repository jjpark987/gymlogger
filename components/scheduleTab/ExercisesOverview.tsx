import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

import { updateExercise } from "@/database/exercise";
import { Day, Exercise } from "@/database/types";

interface ExercisesOverviewProps {
  day: Day;
  exercises: (Exercise | null)[];
  onSelectExercise: (exercise: Exercise) => Promise<void>;
  onSelectSlot: (orderNum: number) => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function ExercisesOverview({
  day,
  exercises,
  onSelectExercise,
  onSelectSlot,
  onBack,
  onRefresh,
}: ExercisesOverviewProps) {
  const [reorderMode, setReorderMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<Exercise | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reorderMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 50,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 50,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      shakeAnim.stopAnimation();
      shakeAnim.setValue(0);
      setSelectedForSwap(null);
    }
  }, [reorderMode, shakeAnim]);

  return (
    <>
      <ThemedText type="title">{day.name}</ThemedText>
      <ThemedView style={styles.container}>
        {exercises.map((exercise, index) => {
          const animatedStyle = reorderMode
            ? {
                transform: [
                  {
                    rotate: shakeAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ["-1deg", "1deg"],
                    }),
                  },
                ],
              }
            : {};

          return (
            <Animated.View key={index} style={animatedStyle}>
              {exercise ? (
                <Button
                  mode="contained"
                  onPress={async () => {
                    if (!reorderMode) return onSelectExercise(exercise);

                    if (!selectedForSwap) {
                      setSelectedForSwap(exercise);
                    } else {
                      if (selectedForSwap.id === exercise.id) {
                        setSelectedForSwap(null);
                        return;
                      }

                      const tempOrder = selectedForSwap.orderNum;
                      await updateExercise(selectedForSwap.id, {
                        orderNum: exercise.orderNum,
                      });
                      await updateExercise(exercise.id, {
                        orderNum: tempOrder,
                      });

                      await onRefresh();
                      setSelectedForSwap(null);
                      setReorderMode(false);
                    }
                  }}
                  onLongPress={() => setReorderMode(true)}
                  style={[
                    styles.button,
                    selectedForSwap?.id === exercise.id && reorderMode
                      ? { backgroundColor: "#FF7F50" }
                      : {},
                  ]}
                  labelStyle={styles.buttonLabel}
                >
                  {exercise.name}
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => onSelectSlot(index + 1)}
                  onLongPress={() => setReorderMode(true)}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  +
                </Button>
              )}
            </Animated.View>
          );
        })}
        <Button
          mode="contained"
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
  container: {
    gap: 30,
    marginTop: 20,
  },
  buttonLabel: {
    fontSize: 18,
  },
  button: {
    backgroundColor: "#1D3D6C",
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  backButton: {
    backgroundColor: "#4A2C1D",
    paddingVertical: 5,
    borderRadius: 5,
  },
});
