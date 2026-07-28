import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_DOG_PROFILE } from '../data/dogBreeds';

const DOG_PROFILE_KEY = '@walk_with_reya/dog_profile';

export async function loadDogProfile() {
  try {
    const raw = await AsyncStorage.getItem(DOG_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_DOG_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || DEFAULT_DOG_PROFILE.name,
      breed: parsed.breed || DEFAULT_DOG_PROFILE.breed,
      ageYears: String(parsed.ageYears ?? DEFAULT_DOG_PROFILE.ageYears),
      weightKg: String(parsed.weightKg ?? DEFAULT_DOG_PROFILE.weightKg),
    };
  } catch {
    return { ...DEFAULT_DOG_PROFILE };
  }
}

export async function saveDogProfile(profile) {
  const next = {
    name: String(profile?.name || '').trim() || DEFAULT_DOG_PROFILE.name,
    breed: String(profile?.breed || '').trim() || DEFAULT_DOG_PROFILE.breed,
    ageYears: String(profile?.ageYears ?? '').trim() || DEFAULT_DOG_PROFILE.ageYears,
    weightKg: String(profile?.weightKg ?? '').trim() || DEFAULT_DOG_PROFILE.weightKg,
  };
  await AsyncStorage.setItem(DOG_PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function normalizeDogProfileInput({ name, breed, ageYears, weightKg }) {
  const age = parseFloat(String(ageYears).replace(',', '.'));
  const weight = parseFloat(String(weightKg).replace(',', '.'));

  return {
    name: String(name || '').trim() || DEFAULT_DOG_PROFILE.name,
    breed: String(breed || '').trim() || DEFAULT_DOG_PROFILE.breed,
    ageYears: Number.isFinite(age) && age > 0 ? age : Number(DEFAULT_DOG_PROFILE.ageYears),
    weightKg:
      Number.isFinite(weight) && weight > 0 ? weight : Number(DEFAULT_DOG_PROFILE.weightKg),
  };
}
