// import * as TaskManager from 'expo-task-manager';
// import * as BackgroundFetch from 'expo-background-fetch';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { appendLog } from '@/logs/logManager';
// import { insertDayLogs } from '@/database/log';
// import { DayLogs } from '@/database/types';

// const TASK_NAME = 'save-day-log-task';

// async function saveDayLogTask() {
//   const now = new Date();
//   const timestamp = now.toISOString();
//   const currentHour = now.getHours();
//   const currentMinute = now.getMinutes();
//   console.log(now, timestamp, currentHour, currentMinute)

//   let logEntry = `[${timestamp}] 🕒 Background task triggered! Checking logs...\n`;

//   try {
//     if (currentHour < 22 || (currentHour === 22 && currentMinute < 59) || currentHour > 23) {
//       logEntry += `⏳ Not within 22:59-23:59. Current time: ${currentHour}:${currentMinute}. Skipping...\n`;
//       await appendLog(logEntry);
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     const storedLog = await AsyncStorage.getItem('dayLog');
//     const dayLog: DayLogs | null = storedLog ? JSON.parse(storedLog) : null;

//     if (!dayLog) {
//       logEntry += `⚠️ Skipped gym on day ${now.getDate()}\n`;
//       await appendLog(logEntry);
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     // await insertDayLogs(dayLog);
//     // await AsyncStorage.removeItem('dayLog');

//     logEntry += `✅ Saved ${JSON.stringify(dayLog)} on day ${now.getDate()}\n`;
//     await appendLog(logEntry);

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (error) {
//     logEntry += `❌ Error saving day log: ${error}\n`;
//     await appendLog(logEntry);
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// }

// TaskManager.defineTask(TASK_NAME, saveDayLogTask);

// export async function registerBackgroundTask() {
//   const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
//   if (isRegistered) {
//     console.log('✅ Background task is already registered');
//     return;
//   }

//   try {
//     await BackgroundFetch.registerTaskAsync(TASK_NAME, {
//       // minimumInterval: 60 * 60,
//       minimumInterval: 30,
//       stopOnTerminate: false,
//       startOnBoot: true
//     });
//     console.log('🚀 Background task registered successfully!');
//   } catch (error) {
//     console.error('❌ Error registering background task:', error);
//   }
// }
