import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from "@react-native-async-storage/async-storage";

async function saveDayLogTask() {
  console.log('🕒 Background task triggered! Checking logs...');

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < 15 || (currentHour === 15 && currentMinute < 59) || currentHour > 16) {
      console.log(`⏳ Not within 15:59-16:59. Current time: ${currentHour}:${currentMinute}. Skipping...`);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // if (currentHour < 22 || (currentHour === 22 && currentMinute < 59) || currentHour > 23) {
    //   console.log(`⏳ Not within 22:59-23:59. Current time: ${currentHour}:${currentMinute}. Skipping...`);
    //   return BackgroundFetch.BackgroundFetchResult.NoData;
    // }

    const dayLog = await AsyncStorage.getItem('dayLog');

    if (!dayLog) {
      console.log('✅ No logs to save. Skipping...');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('📋 Saved Logs:', dayLog);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ Error retrieving day log:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

TaskManager.defineTask('save-day-log-task', saveDayLogTask);
