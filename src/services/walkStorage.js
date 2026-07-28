import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACTIVE_WALK_KEY,
  MAX_HISTORY_ITEMS,
  PENDING_SUMMARY_KEY,
  WALK_HISTORY_KEY,
} from './walkConstants';
import { estimateDogCalories } from '../utils/calories';

export async function loadActiveWalk() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_WALK_KEY);
    if (!raw) return null;
    const walk = JSON.parse(raw);
    return walk?.active ? walk : null;
  } catch {
    return null;
  }
}

export async function saveActiveWalk(walk) {
  if (!walk) {
    await AsyncStorage.removeItem(ACTIVE_WALK_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_WALK_KEY, JSON.stringify(walk));
}

export async function clearActiveWalk() {
  await AsyncStorage.removeItem(ACTIVE_WALK_KEY);
}

export async function loadWalkHistory() {
  try {
    const raw = await AsyncStorage.getItem(WALK_HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveWalkToHistory(summary) {
  const history = await loadWalkHistory();
  const next = [summary, ...history].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(WALK_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export async function deleteWalkFromHistory(id) {
  const history = await loadWalkHistory();
  const next = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(WALK_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export async function setPendingSummary(summary) {
  if (!summary) {
    await AsyncStorage.removeItem(PENDING_SUMMARY_KEY);
    return;
  }
  await AsyncStorage.setItem(PENDING_SUMMARY_KEY, JSON.stringify(summary));
}

export async function loadPendingSummary() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SUMMARY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearPendingSummary() {
  await AsyncStorage.removeItem(PENDING_SUMMARY_KEY);
}

export function buildWalkSummary(walk, { endedReason = 'manual' } = {}) {
  const endedAt = Date.now();
  const durationMs = Math.max(0, endedAt - (walk.startedAt || endedAt));
  const distanceMeters = walk.distanceMeters || 0;
  const calories = estimateDogCalories({
    weightKg: walk.weightKg,
    distanceMeters,
    durationMs,
  });

  return {
    id: walk.id || `walk_${endedAt}`,
    dogName: walk.dogName || 'Кучето',
    weightKg: walk.weightKg || 15,
    route: walk.route || [],
    distanceMeters,
    durationMs,
    calories,
    startedAt: walk.startedAt || endedAt,
    endedAt,
    endedReason,
  };
}
