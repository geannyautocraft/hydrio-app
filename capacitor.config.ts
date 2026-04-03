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
};

export default config;
