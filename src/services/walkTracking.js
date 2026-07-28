import { DeviceEventEmitter, Platform } from 'react-native';
import * as Location from 'expo-location';
import {
  MAX_GPS_JUMP_M,
  MAX_ROUTE_POINTS,
  MIN_POINT_DISTANCE_M,
  WALK_ENDED_EVENT,
  WALK_LOCATION_TASK,
  WALK_UPDATED_EVENT,
} from './walkConstants';
import {
  buildWalkSummary,
  clearActiveWalk,
  loadActiveWalk,
  saveActiveWalk,
  saveWalkToHistory,
  setPendingSummary,
} from './walkStorage';
import { distanceMeters } from '../utils/geo';

export function applyLocationToWalk(walk, coords) {
  if (!walk?.active || !coords) return { walk, changed: false };

  const next = {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  const route = Array.isArray(walk.route) ? [...walk.route] : [];
  const last = route[route.length - 1];

  if (!last) {
    return {
      walk: {
        ...walk,
        route: [next],
        currentLocation: next,
        updatedAt: Date.now(),
      },
      changed: true,
    };
  }

  const step = distanceMeters(last, next);
  if (step < MIN_POINT_DISTANCE_M) {
    return {
      walk: {
        ...walk,
        currentLocation: next,
        updatedAt: Date.now(),
      },
      changed: true,
    };
  }

  let distanceMetersTotal = walk.distanceMeters || 0;
  if (step <= MAX_GPS_JUMP_M) {
    distanceMetersTotal += step;
  }

  route.push(next);
  if (route.length > MAX_ROUTE_POINTS) {
    route.splice(0, route.length - MAX_ROUTE_POINTS);
  }

  return {
    walk: {
      ...walk,
      route,
      distanceMeters: distanceMetersTotal,
      currentLocation: next,
      updatedAt: Date.now(),
    },
    changed: true,
  };
}

export async function persistWalkUpdate(walk) {
  await saveActiveWalk(walk);
  DeviceEventEmitter.emit(WALK_UPDATED_EVENT, walk);
  return walk;
}

export async function finalizeWalk({
  endedReason = 'manual',
  walk: providedWalk = null,
} = {}) {
  const walk = providedWalk || (await loadActiveWalk());
  if (!walk?.active) {
    return null;
  }

  walk.active = false;
  await saveActiveWalk(walk);

  try {
    const started = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
    }
  } catch {
    // ignore
  }

  const summary = buildWalkSummary(walk, { endedReason });
  await saveWalkToHistory(summary);
  await setPendingSummary(summary);
  await clearActiveWalk();

  DeviceEventEmitter.emit(WALK_ENDED_EVENT, summary);
  return summary;
}

export async function startBackgroundWalk({ dogName, weightKg }) {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    throw new Error('Нужно е разрешение за локация, за да следим разходката.');
  }

  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    throw new Error('Включете GPS / услугите за местоположение.');
  }

  let backgroundGranted = false;
  try {
    const bg = await Location.requestBackgroundPermissionsAsync();
    backgroundGranted = bg.status === 'granted';
  } catch {
    backgroundGranted = false;
  }

  const initial = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const startPoint = {
    latitude: initial.coords.latitude,
    longitude: initial.coords.longitude,
  };

  const now = Date.now();
  const walk = {
    id: `walk_${now}`,
    active: true,
    dogName: dogName || 'Рея',
    weightKg: weightKg || 5,
    startedAt: now,
    updatedAt: now,
    distanceMeters: 0,
    route: [startPoint],
    currentLocation: startPoint,
    backgroundGranted,
  };

  await saveActiveWalk(walk);
  DeviceEventEmitter.emit(WALK_UPDATED_EVENT, walk);

  let backgroundStarted = false;
  try {
    const already = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
    if (already) {
      await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
    }

    await Location.startLocationUpdatesAsync(WALK_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 3000,
      distanceInterval: 5,
      deferredUpdatesInterval: 3000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: `Разходка с ${walk.dogName}`,
        notificationBody: 'Следим разходката на заден план',
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
    });
    backgroundStarted = true;
  } catch (error) {
    console.warn('Background location unavailable:', error?.message || error);
    backgroundStarted = false;
  }

  return { walk, backgroundStarted, backgroundGranted };
}

export async function stopWalkFromUi() {
  return finalizeWalk({ endedReason: 'manual' });
}

export function canUseBackgroundLocation() {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}
