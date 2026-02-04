import { Capacitor } from '@capacitor/core';

export const isApp = Capacitor.isNativePlatform();
export const isWeb = !isApp;
export const platform = Capacitor.getPlatform(); 