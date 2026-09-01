import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Appbito',
  webDir: 'www',
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      backgroundColor: "#000000",
      launchShowDuration: 3000,
    }
  },
  "server": {
    "androidScheme": "http",
    "cleartext": true
  }
};

export default config;
