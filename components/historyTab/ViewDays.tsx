import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";

import { LoggedDay, LoggedWeek } from "@/database/types";

interface ViewDaysProps {
  week: LoggedWeek;
  days: (LoggedDay | null)[];
  onSelectDay: (day: LoggedDay) => void;
  onBack: () => void;
}

export function ViewDays({ week, days, onSelectDay, onBack }: ViewDaysProps) {
  return (
    <>
      <ThemedText type="title">{week.display}</ThemedText>
      <ThemedView style={styles.container}>
        {days.map((day, index) =>
          day ? (
            <Button
              key={index}
              mode="contained"
              onPress={() => onSelectDay(day)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {day.display}
            </Button>
          ) : (
            <ThemedView key={index} style={styles.placeholderButton}>
              <ThemedText style={styles.buttonLabel}>-</ThemedText>
            </ThemedView>
          ),
        )}
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
    gap: 20,
    marginTop: 20,
  },
  buttonLabel: {
    fontSize: 18,
  },
  button: {
    backgroundColor: "#1D6A47",
    paddingVertical: 5,
    borderRadius: 5,
    height: 50,
  },
  backButton: {
    backgroundColor: "#4A2C1D",
    paddingVertical: 5,
    borderRadius: 5,
  },
  placeholderButton: {
    backgroundColor: "#1D6A47",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    height: 50,
  },
});
