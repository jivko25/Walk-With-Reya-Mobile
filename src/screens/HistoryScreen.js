import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DogBanner } from '../components/DogBanner';
import { PawButton } from '../components/PawButton';
import { deleteWalkFromHistory, loadWalkHistory } from '../services/walkStorage';
import { colors, spacing } from '../theme';
import { formatDistance, formatDuration } from '../utils/geo';

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString('bg-BG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    const list = await loadWalkHistory();
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onDelete = (item) => {
    Alert.alert('Изтриване', `Да махнем разходката с ${item.dogName}?`, [
      { text: 'Не', style: 'cancel' },
      {
        text: 'Да',
        style: 'destructive',
        onPress: async () => {
          const next = await deleteWalkFromHistory(item.id);
          setItems(next);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <DogBanner
          title="История"
          subtitle="Всички разходки на едно място — лапички, километри и спомени."
        />

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🦴</Text>
              <Text style={styles.emptyText}>
                Все още няма разходки. Време е за първата!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('Summary', item)}
              onLongPress={() => onDelete(item)}
            >
              <Text style={styles.cardTitle}>
                🐶 {item.dogName} · {formatDate(item.endedAt || item.startedAt)}
              </Text>
              <Text style={styles.cardMeta}>
                {formatDistance(item.distanceMeters || 0)} ·{' '}
                {formatDuration(item.durationMs || 0)} · {item.calories || 0} kcal
              </Text>
              <Text style={styles.cardHint}>Докосни за детайли · задръж за изтриване</Text>
            </Pressable>
          )}
        />

        <PawButton
          title="Назад към началото"
          variant="secondary"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 28,
  },
  list: {
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.cocoa,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.softCream,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.caramel,
    padding: spacing.md,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.chocolate,
  },
  cardMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.cocoa,
    marginTop: 6,
  },
  cardHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.pawBrown,
    marginTop: 6,
  },
});
