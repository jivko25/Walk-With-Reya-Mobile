import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PawButton } from '../components/PawButton';
import { StatBubble } from '../components/StatBubble';
import { WalkMap } from '../components/WalkMap';
import { useWalkTracker } from '../hooks/useWalkTracker';
import { WALK_ENDED_EVENT } from '../services/walkConstants';
import { colors, spacing } from '../theme';
import { formatDistance, formatDuration } from '../utils/geo';

export default function WalkScreen({ navigation, route }) {
  const { dogName, weightKg, breed, ageYears } = route.params;
  const mapRef = useRef(null);
  const [starting, setStarting] = useState(true);
  const {
    route: path,
    distance,
    elapsedMs,
    currentLocation,
    error,
    backgroundStarted,
    startWalk,
    resumeWalk,
    stopWalk,
  } = useWalkTracker();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const ok = route.params?.resume
          ? await resumeWalk()
          : await startWalk({ dogName, weightKg, breed, ageYears });
        if (active) {
          setStarting(false);
          if (!ok && route.params?.resume) {
            navigation.replace('Home');
          }
        }
      } catch (err) {
        console.warn('Walk start failed:', err?.message || err);
        if (active) setStarting(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [ageYears, breed, dogName, weightKg, navigation, resumeWalk, route.params?.resume, startWalk]);

  useEffect(() => {
    if (currentLocation && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        {
          ...currentLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        600
      );
    }
  }, [currentLocation]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(WALK_ENDED_EVENT, (summary) => {
      if (!summary) return;
      navigation.replace('Summary', summary);
    });
    return () => sub.remove();
  }, [navigation]);

  const onEnd = async () => {
    const summary = await stopWalk();
    if (summary) {
      navigation.replace('Summary', summary);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Разходка с {dogName}</Text>
        <Text style={styles.headerSub}>
          {backgroundStarted
            ? 'Следим ви и на заден план'
            : 'Следим лапичките ви'}
        </Text>
      </View>

      <View style={styles.mapWrap}>
        {starting && !currentLocation ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.softOrange} />
            <Text style={styles.loadingText}>Търсим ви по картата...</Text>
          </View>
        ) : (
          <WalkMap
            mapRef={mapRef}
            currentLocation={currentLocation}
            path={path}
            interactive
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <StatBubble emoji="⏱️" label="Време" value={formatDuration(elapsedMs)} />
          <StatBubble emoji="📏" label="Разстояние" value={formatDistance(distance)} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {error ? (
          <PawButton
            title="Назад към началото"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        ) : (
          <PawButton
            title="Край на разходката"
            variant="danger"
            onPress={onEnd}
            disabled={starting}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: colors.chocolate,
  },
  headerSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.cocoa,
    marginTop: 2,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: spacing.md,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.caramel,
    backgroundColor: colors.softCream,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.cocoa,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  error: {
    fontFamily: 'Nunito_700Bold',
    color: colors.softRed,
    textAlign: 'center',
  },
});
