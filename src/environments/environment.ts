import { Capacitor } from '@capacitor/core';

export const environment = {
    production: false,
    apiUrl: Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080' : 'http://localhost:8080'
}