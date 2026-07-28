import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DogBanner } from '../components/DogBanner';
import { PawButton } from '../components/PawButton';
import { loadActiveWalk } from '../services/walkStorage';
import { colors, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const [dogName, setDogName] = useState('Рея');
  const [weightKg, setWeightKg] = useState('15');
  const [activeWalk, setActiveWalk] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const walk = await loadActiveWalk();
        if (alive) {
          setActiveWalk(walk?.active ? walk : null);
          if (walk?.active) {
            setDogName(walk.dogName || 'Рея');
            setWeightKg(String(walk.weightKg || 15));
          }
        }
      })();
      return () => {
        alive = false;
      };
    }, [])
  );

  const onStart = () => {
    const weight = parseFloat(String(weightKg).replace(',', '.'));
    navigation.navigate('Walk', {
      dogName: dogName.trim() || 'Кучето',
      weightKg: Number.isFinite(weight) && weight > 0 ? weight : 15,
    });
  };

  const onContinue = () => {
    if (!activeWalk) return;
    navigation.navigate('Walk', {
      dogName: activeWalk.dogName || 'Кучето',
      weightKg: activeWalk.weightKg || 15,
      resume: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <DogBanner
            title="Разходка с Рея"
            subtitle="Натисни бутона и тръгвайте заедно — следим пътечката ви като верни лапички."
          />

          {activeWalk ? (
            <View style={styles.activeBox}>
              <Text style={styles.activeTitle}>Има незавършена разходка</Text>
              <Text style={styles.activeText}>
                С {activeWalk.dogName || 'кучето'} — можеш да продължиш откъдето спряхте.
              </Text>
              <PawButton title="Продължи разходката" onPress={onContinue} />
              <View style={styles.gap} />
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Кой тръгва днес?</Text>

            <Text style={styles.fieldLabel}>Име на кучето</Text>
            <TextInput
              value={dogName}
              onChangeText={setDogName}
              placeholder="Рея"
              placeholderTextColor={colors.pawBrown}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Тегло (кг)</Text>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="15"
              placeholderTextColor={colors.pawBrown}
              style={styles.input}
            />

            <Text style={styles.hint}>
              Теглото помага да сметнем приблизително колко калории е изгорило кучето.
              Докато разходката тече, Android показва системна нотификация за следенето.
            </Text>
          </View>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Преди да тръгнете</Text>
            <Text style={styles.tipLine}>🦴 Вземете вода за по-дълги разходки</Text>
            <Text style={styles.tipLine}>🐾 Проверете лапичките и нашийника</Text>
            <Text style={styles.tipLine}>🌳 Изберете сенчесто местенце в жега</Text>
          </View>

          <PawButton title="Начало на разходката" onPress={onStart} />
          <View style={styles.gap} />
          <PawButton
            title="История на разходките"
            variant="secondary"
            onPress={() => navigation.navigate('History')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  activeBox: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.softOrange,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  activeTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.chocolate,
    marginBottom: 6,
  },
  activeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.cocoa,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.softCream,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.caramel,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.chocolate,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.cocoa,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.peach,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: colors.chocolate,
    marginBottom: spacing.md,
  },
  hint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.pawBrown,
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.peach,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.chocolate,
    marginBottom: 8,
  },
  tipLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.cocoa,
    marginBottom: 6,
  },
  gap: {
    height: 12,
  },
});
