import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

import { useDay } from "@/context/DayContext";
import { Day } from "@/database/types";

interface ScheduleOverviewProps {
  days: Day[];
  onSelectDay: (dayId: number) => Promise<void>;
}

export function ScheduleOverview({ days, onSelectDay }: ScheduleOverviewProps) {
  const { isWeekdayRest, toggleWeekdayRest } = useDay();

  return (
    <>
      <ThemedText type="title">Schedule</ThemedText>
      <ThemedView style={styles.container}>
        {days.map((day) => {
          const rest = isWeekdayRest(day.id); // day.id is 0..4 for Mon..Fri
          return (
            <Button
              key={day.id}
              mode="contained"
              onPress={() => onSelectDay(day.id)}
              onLongPress={() => toggleWeekdayRest(day.id)}
              style={[styles.button, rest && styles.restButton]}
              labelStyle={styles.buttonLabel}
              accessibilityLabel={`${day.name}${rest ? " (Rest day)" : ""}`}
            >
              {day.name}
            </Button>
          );
        })}
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
  // Dim state to indicate a Rest weekday
  restButton: {
    opacity: 0.6,
  },
});
