import { Image, StyleSheet } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";

import { Day } from "@/database/types";

export function RestDay({ day }: { day: Day }) {
  return (
    <>
      <ThemedText type="title">{day.name}</ThemedText>
      <ThemedView style={styles.container}>
        <Image
          source={require("../../assets/images/rest-day.png")}
          style={styles.image}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    resizeMode: "contain",
    width: 300,
    height: 300,
    marginTop: 50,
  },
});
