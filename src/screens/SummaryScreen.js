import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DogBanner } from '../components/DogBanner';
import { PawButton } from '../components/PawButton';
import { StatBubble } from '../components/StatBubble';
import { WalkMap } from '../components/WalkMap';
import { clearPendingSummary } from '../services/walkStorage';
import { colors, spacing } from '../theme';
import { describePace, estimateDogCalories } from '../utils/calories';
import { formatDistance, formatDuration } from '../utils/geo';
import { getWalkTips } from '../utils/tips';

export default function SummaryScreen({ navigation, route }) {
  const {
    dogName,
    weightKg,
    route: path = [],
    distanceMeters = 0,
    durationMs = 0,
    calories: caloriesParam,
  } = route.params;

  useEffect(() => {
    clearPendingSummary();
  }, []);

  const calories =
    typeof caloriesParam === 'number'
      ? caloriesParam
      : estimateDogCalories({
          weightKg,
          distanceMeters,
          durationMs,
        });
  const pace = describePace(distanceMeters, durationMs);
  const tips = getWalkTips({
    distanceMeters,
    durationMs,
    calories,
    weightKg,
  });

  const mid =
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : { latitude: 42.6977, longitude: 23.3219 };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <DogBanner
          title="Браво, пуделче!"
          subtitle={`${dogName} свърши страхотна разходка. Ето какво направихте заедно.`}
        />

        <View style={styles.stats}>
          <StatBubble emoji="📏" label="Разстояние" value={formatDistance(distanceMeters)} />
          <StatBubble emoji="⏱️" label="Време" value={formatDuration(durationMs)} />
        </View>

        <View style={styles.stats}>
          <StatBubble emoji="🔥" label="Калории (прибл.)" value={`${calories} kcal`} />
          <StatBubble emoji="🐩" label="Темпо" value={pace} />
        </View>

        {path.length > 1 ? (
          <View style={styles.mapWrap}>
            <WalkMap
              currentLocation={mid}
              path={path}
              interactive={false}
              showsUserLocation={false}
            />
          </View>
        ) : null}

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Съвети за {dogName}</Text>
          {tips.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Text style={styles.tipPaw}>🐾</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
          <Text style={styles.disclaimer}>
            Калориите са приблизителни и не заместват съвет от ветеринар.
          </Text>
        </View>

        <PawButton title="Нова разходка" onPress={() => navigation.navigate('Home')} />
        <View style={{ height: 12 }} />
        <PawButton
          title="История на разходките"
          variant="secondary"
          onPress={() => navigation.navigate('History')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  mapWrap: {
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.caramel,
  },
  tipsBox: {
    backgroundColor: colors.softCream,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.peach,
    padding: spacing.lg,
  },
  tipsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: colors.chocolate,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  tipPaw: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.cocoa,
    lineHeight: 21,
  },
  disclaimer: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.pawBrown,
    marginTop: 8,
  },
});
