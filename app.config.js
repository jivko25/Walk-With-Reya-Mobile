require('dotenv').config();

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: 'Walk With Reya',
    slug: 'walk-with-reya-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    // Windows local builds: New Arch CMake object paths exceed MAX_PATH (~260).
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF8F1',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.walkwithreya.app',
      infoPlist: {
        UIBackgroundModes: ['location'],
        NSLocationWhenInUseUsageDescription:
          'Приложението следи разходката ви с кучето, за да изчисли разстояние и калории.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Приложението следи разходката и на заден план, за да показва живото разстояние.',
        NSLocationAlwaysUsageDescription:
          'Приложението следи разходката и на заден план, за да показва живото разстояние.',
      },
      config: {
        googleMapsApiKey,
      },
    },
    android: {
      package: 'com.walkwithreya.app',
      adaptiveIcon: {
        backgroundColor: '#FFF8F1',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Разрешете достъп до локацията, за да следим разходката с кучето.',
          locationAlwaysAndWhenInUsePermission:
            'Разрешете фонова локация, за да следим разходката и когато приложението е минимизирано.',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'b45916bb-8e1b-4d95-8149-1b0d1744b7f5',
      },
      googleMapsApiKey,
    },
  },
};
