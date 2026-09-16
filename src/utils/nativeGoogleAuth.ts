import { registerPlugin, Capacitor } from '@capacitor/core';

export interface NativeGoogleAuthPluginInterface {
  pickGoogleAccount(): Promise<{ email: string }>;
}

export const NativeGoogleAuth = registerPlugin<NativeGoogleAuthPluginInterface>('NativeGoogleAuth');

/**
 * Opens the native Android Google Account picker dialog.
 * This triggers Android OS's built-in AccountManager bottom sheet/dialog
 * displaying all Google accounts currently logged in on the device.
 */
export async function pickDeviceGoogleAccount(): Promise<string | null> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const res = await NativeGoogleAuth.pickGoogleAccount();
      if (res && res.email) {
        return res.email.trim();
      }
    } catch (err: any) {
      console.warn('Native Google account picker status:', err?.message || err);
      // If user cancelled, return null
      if (typeof err === 'string' && err.toLowerCase().includes('batal')) {
        return null;
      }
      if (err?.message && err.message.toLowerCase().includes('batal')) {
        return null;
      }
      throw err;
    }
  }
  return null;
}
