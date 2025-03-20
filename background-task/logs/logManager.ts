// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LOG_KEY = 'background-task-logs';

// export async function appendLog(newLog: string) {
//   try {
//     const logs = await AsyncStorage.getItem(LOG_KEY);
//     let logArray = logs ? JSON.parse(logs) : [];

//     logArray.push({ timestamp: new Date().toISOString(), message: newLog });

//     const oneMonthAgo = new Date();
//     oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
//     logArray = logArray.filter((log: { timestamp: string ; }) => new Date(log.timestamp) >= oneMonthAgo);

//     await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logArray));
//   } catch (error) {
//     console.error('❌ Error writing to log:', error);
//   }
// }

// export async function getLogs() {
//   try {
//     const logs = await AsyncStorage.getItem(LOG_KEY);
//     return logs ? JSON.parse(logs) : [];
//   } catch (error) {
//     console.error('❌ Error reading logs:', error);
//     return [];
//   }
// }

// export async function printLogs() {
//   const logs = await getLogs();
//   if (logs.length === 0) {
//     console.log('📭 No logs available.');
//     return;
//   }

//   console.log('📜 Background Task Logs:');
//   logs.forEach((log: { timestamp: string; message: string; }) => {
//     console.log(`[${log.timestamp}] ${log.message}`);
//   });
// }

// export async function clearLogs() {
//   try {
//     await AsyncStorage.removeItem(LOG_KEY);
//     console.log('🧹 Logs cleared.');
//   } catch (error) {
//     console.error('❌ Error clearing logs:', error);
//   }
// }
