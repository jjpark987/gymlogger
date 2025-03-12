import { Image, StyleSheet, Platform } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getDays } from '@/database/day';
import { useEffect, useState } from 'react';
import { Button } from 'react-native-paper';


export default function Schedule() {
  const [days, setDays] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    async function fetchDays() {
      const fetchedDays = await getDays();
      setDays(fetchedDays);
    }
    fetchDays();
  }, []);
  
console.log(days)

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D6C' }}
      headerImage={
        <IconSymbol size={300} name='list.clipboard' color='white' style={styles.background} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>Schedule</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        {days.map(day => (
          <Button 
            key={day.id} 
            mode='contained' 
            onPress={() => console.log('Pressed')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {day.name}
          </Button>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    marginTop: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContainer: {
    gap: 20,
    marginTop: 20
  },
  button: {
    backgroundColor: '#1D3D6C',
    paddingVertical: 5
  },
  buttonLabel: {
    fontSize: 18
  }
});
