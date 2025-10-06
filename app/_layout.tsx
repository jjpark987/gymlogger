import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { DayProvider } from "@/context/DayContext";
import { setupDatabase } from "@/database/setup";
// import { resetDatabase } from "@/database/database";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { registerBackgroundTask } from '@/tasks/taskManager';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function initDatabase() {
      // await resetDatabase();
      await setupDatabase();
      SplashScreen.hideAsync();
    }

    if (loaded) {
      initDatabase();
      // registerBackgroundTask();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <DayProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DayProvider>
  );
}
