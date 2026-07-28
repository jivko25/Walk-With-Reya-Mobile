/**
 * Rough calorie estimate for a dog on a walk.
 * Based on weight, distance and average pace — not veterinary advice.
 *
 * kcal ≈ weightKg × distanceKm × paceFactor
 */
export function estimateDogCalories({ weightKg, distanceMeters, durationMs }) {
  const weight = Math.max(1, Number(weightKg) || 15);
  const distanceKm = Math.max(0, distanceMeters) / 1000;
  const hours = Math.max(durationMs, 1000) / (1000 * 60 * 60);
  const speedKmh = hours > 0 ? distanceKm / hours : 0;

  let paceFactor = 0.7;
  if (speedKmh >= 5.5) paceFactor = 1.15;
  else if (speedKmh >= 3.5) paceFactor = 0.9;
  else if (speedKmh < 2) paceFactor = 0.55;

  const calories = weight * distanceKm * paceFactor;
  return Math.max(0, Math.round(calories));
}

export function describePace(distanceMeters, durationMs) {
  const distanceKm = distanceMeters / 1000;
  const hours = Math.max(durationMs, 1000) / (1000 * 60 * 60);
  const speedKmh = hours > 0 ? distanceKm / hours : 0;

  if (speedKmh >= 5.5) return 'Бърза разходка';
  if (speedKmh >= 3.5) return 'Умерено темпо';
  if (speedKmh >= 2) return 'Спокойна разходка';
  return 'Много спокойно темпо';
}
