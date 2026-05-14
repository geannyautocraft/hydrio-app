import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hydrio.app',
  appName: 'Hydrio',
  webDir: 'dist',
  android: {
    backgroundColor: '#f0f9ff',
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'password'],
    },
  },
};

export default config;
