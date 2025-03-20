import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';

import { resetDatabase } from '@/database/database';
import { setupDatabase } from '@/database/setup';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DayProvider } from '@/context/DayContext';

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

    // async function registerBackgroundTask() {
    //   const isRegistered = await TaskManager.isTaskRegisteredAsync('save-day-log-task');
    //   if (!isRegistered) {
    //     await BackgroundFetch.registerTaskAsync('save-day-log-task', {
    //       minimumInterval: 30,
    //       // minimumInterval: 60 * 60,
    //       stopOnTerminate: false,
    //       startOnBoot: true,
    //     });
    //     console.log('🚀 Background task registered!');
    //   } else {
    //     console.log('✅ Background task already registered.');
    //   }
    // }

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
