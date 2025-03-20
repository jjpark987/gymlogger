import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';

import { resetDatabase } from '@/database/database';
import { setupDatabase } from '@/database/setup';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DayProvider } from '@/context/DayContext';
// import { registerBackgroundTask } from '@/tasks/taskManager';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </DayProvider>
  );
}
