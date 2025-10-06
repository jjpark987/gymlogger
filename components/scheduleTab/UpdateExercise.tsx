import { Button, TextInput } from "react-native-paper";
import { StyleSheet } from "react-native";
import { ThemedView } from "../ThemedView";

import { InputExercise } from "@/database/types";

interface UpdateExerciseProps {
  updatedExercise: InputExercise;
  setUpdatedExercise: (exercise: InputExercise) => void;
  onBack: () => void;
  onSaveExercise: () => Promise<void>;
  onDeleteExercise: () => Promise<void>;
}

export function UpdateExercise({
  updatedExercise,
  setUpdatedExercise,
  onBack,
  onSaveExercise,
  onDeleteExercise,
}: UpdateExerciseProps) {
  return (
    <>
      <ThemedView style={styles.container}>
        <TextInput
          placeholder="Name"
          value={updatedExercise.name}
          onChangeText={(text) =>
            setUpdatedExercise({ ...updatedExercise, name: text })
          }
          style={styles.input}
        />
        <ThemedView style={styles.inputContainer}>
          <TextInput
            placeholder="Weight"
            keyboardType="numeric"
            value={updatedExercise.weight.toString()}
            onChangeText={(text) =>
              setUpdatedExercise({ ...updatedExercise, weight: text })
            }
            style={[styles.input, styles.inputItem]}
          />
          <TextInput
            placeholder="Increment"
            keyboardType="numeric"
            value={updatedExercise.increment.toString()}
            onChangeText={(text) =>
              setUpdatedExercise({ ...updatedExercise, increment: text })
            }
            style={[styles.input, styles.inputItem]}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={onBack}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={onSaveExercise}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save
        </Button>
        <Button
          mode="contained"
          onPress={() => onDeleteExercise()}
          style={styles.delButton}
          labelStyle={styles.buttonLabel}
        >
          Delete
        </Button>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  inputItem: {
    flex: 1,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 5,
    fontSize: 18,
  },
  switch: {
    transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }],
    marginTop: 10,
    marginLeft: 10,
  },
  buttonContainer: {
    gap: 20,
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
    marginBottom: 50,
    height: 50,
  },
  delButton: {
    backgroundColor: "#6C1D1D",
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 50,
    height: 50,
  },
});
