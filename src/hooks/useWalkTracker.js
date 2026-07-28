import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import * as Location from 'expo-location';
import {
  WALK_ENDED_EVENT,
  WALK_LOCATION_TASK,
  WALK_UPDATED_EVENT,
} from '../services/walkConstants';
import { loadActiveWalk } from '../services/walkStorage';
import {
  applyLocationToWalk,
  persistWalkUpdate,
  startBackgroundWalk,
  stopWalkFromUi,
} from '../services/walkTracking';

export function useWalkTracker() {
  const [isWalking, setIsWalking] = useState(false);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundStarted, setBackgroundStarted] = useState(false);

  const foregroundWatchRef = useRef(null);
  const tickRef = useRef(null);
  const startedAtRef = useRef(null);
  const endingRef = useRef(false);

  const clearForegroundWatch = useCallback(async () => {
    if (foregroundWatchRef.current) {
      foregroundWatchRef.current.remove();
      foregroundWatchRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const hydrateFromWalk = useCallback((walk) => {
    if (!walk) return;
    startedAtRef.current = walk.startedAt;
    setIsWalking(Boolean(walk.active));
    setRoute(walk.route || []);
    setDistance(walk.distanceMeters || 0);
    setStartedAt(walk.startedAt || null);
    setCurrentLocation(
      walk.currentLocation || walk.route?.[walk.route.length - 1] || null
    );
    if (walk.startedAt) {
      setElapsedMs(Math.max(0, Date.now() - walk.startedAt));
    }
  }, []);

  const startForegroundFallback = useCallback(async () => {
    await clearForegroundWatch();

    foregroundWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      async (position) => {
        const active = await loadActiveWalk();
        if (!active?.active) return;
        const { walk, changed } = applyLocationToWalk(active, position.coords);
        if (changed) {
          await persistWalkUpdate(walk);
        }
      }
    );
  }, [clearForegroundWatch]);

  const startWalk = useCallback(
    async ({ dogName, weightKg, breed, ageYears }) => {
      setError(null);
      endingRef.current = false;

      try {
        const { walk, backgroundStarted: bgOk } = await startBackgroundWalk({
          dogName,
          weightKg,
          breed,
          ageYears,
        });

        setBackgroundStarted(bgOk);
        hydrateFromWalk(walk);

        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = setInterval(() => {
          if (startedAtRef.current) {
            setElapsedMs(Date.now() - startedAtRef.current);
          }
        }, 1000);

        // Use foreground GPS only when background updates are unavailable
        // (e.g. Expo Go), to avoid double-counting distance.
        if (!bgOk) {
          await startForegroundFallback();
        }

        return true;
      } catch (err) {
        setError(err?.message || 'Неуспешен старт на разходката.');
        return false;
      }
    },
    [hydrateFromWalk, startForegroundFallback]
  );

  const resumeWalk = useCallback(async () => {
    setError(null);
    endingRef.current = false;

    const walk = await loadActiveWalk();
    if (!walk?.active) {
      setError('Няма активна разходка.');
      return false;
    }

    hydrateFromWalk(walk);

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 1000);

    let bgOk = false;
    try {
      bgOk = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
    } catch {
      bgOk = false;
    }
    setBackgroundStarted(bgOk);

    if (!bgOk) {
      await startForegroundFallback();
    }

    return true;
  }, [hydrateFromWalk, startForegroundFallback]);

  const stopWalk = useCallback(async () => {
    if (endingRef.current) return null;
    endingRef.current = true;
    await clearForegroundWatch();
    const summary = await stopWalkFromUi();
    setIsWalking(false);
    setBackgroundStarted(false);
    return summary;
  }, [clearForegroundWatch]);

  useEffect(() => {
    const updated = DeviceEventEmitter.addListener(WALK_UPDATED_EVENT, (walk) => {
      hydrateFromWalk(walk);
    });

    const ended = DeviceEventEmitter.addListener(WALK_ENDED_EVENT, () => {
      endingRef.current = true;
      clearForegroundWatch();
      setIsWalking(false);
      setBackgroundStarted(false);
    });

    return () => {
      updated.remove();
      ended.remove();
    };
  }, [clearForegroundWatch, hydrateFromWalk]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      const walk = await loadActiveWalk();
      if (walk?.active) {
        hydrateFromWalk(walk);
      }
    });
    return () => sub.remove();
  }, [hydrateFromWalk]);

  useEffect(() => {
    return () => {
      clearForegroundWatch();
    };
  }, [clearForegroundWatch]);

  return {
    isWalking,
    route,
    distance,
    startedAt,
    elapsedMs,
    currentLocation,
    error,
    backgroundStarted,
    startWalk,
    resumeWalk,
    stopWalk,
    setError,
    hasLocationTask: async () => {
      try {
        return await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
      } catch {
        return false;
      }
    },
  };
}
