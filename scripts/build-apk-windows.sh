#!/usr/bin/env bash
# Local Windows APK build.
# Prefer a short path (C:\reya) — Ninja still breaks on paths > ~260 chars.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d android ]; then
  echo "Missing android/. Run: npx expo prebuild --platform android"
  exit 1
fi

echo "Cleaning native CMake caches..."
rm -rf android/app/.cxx \
  android/app/build \
  node_modules/expo-modules-core/android/.cxx \
  node_modules/expo-modules-core/android/build \
  node_modules/react-native-safe-area-context/android/.cxx \
  node_modules/react-native-safe-area-context/android/build \
  node_modules/react-native-screens/android/.cxx \
  node_modules/react-native-screens/android/build \
  2>/dev/null || true

cd android
./gradlew assembleRelease "$@"

echo ""
echo "APK: $ROOT/android/app/build/outputs/apk/release/app-release.apk"
