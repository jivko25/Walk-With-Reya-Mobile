import { Platform } from 'react-native';
import Constants from 'expo-constants';

function readConfiguredKey() {
  const expoConfig = Constants.expoConfig || Constants.manifest || {};
  return (
    expoConfig?.android?.config?.googleMaps?.apiKey ||
    expoConfig?.ios?.config?.googleMapsApiKey ||
    expoConfig?.extra?.googleMapsApiKey ||
    ''
  );
}

export function getGoogleMapsApiKey() {
  const key = String(readConfiguredKey() || '').trim();
  if (!key || key.startsWith('YOUR_')) return '';
  return key;
}

/**
 * Android Google Maps crashes the whole app without an API key in release builds.
 * iOS can use Apple Maps without a Google key.
 */
export function canRenderMap() {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS !== 'android') return false;
  return Boolean(getGoogleMapsApiKey());
}
