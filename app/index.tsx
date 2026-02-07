import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Navigate to map screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/map');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {!imageError ? (
        <Image
          source={require('@/assets/images/christ-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text style={styles.title}>Campus Navigation</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A73E8',
  },
});

