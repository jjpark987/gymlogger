import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Day } from '@/database/types';

export function RestDay({ day }: { day: Day }) {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>{day.name}</ThemedText>
      </ThemedView>
      <ThemedText>REST DAY</ThemedText>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  }
});
