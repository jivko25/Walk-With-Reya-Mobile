import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DOG_BREEDS } from '../data/dogBreeds';
import { colors, spacing } from '../theme';

export function BreedPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOG_BREEDS;
    return DOG_BREEDS.filter((breed) => breed.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{value || 'Избери порода'}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Порода</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Търси порода..."
              placeholderTextColor={colors.pawBrown}
              style={styles.search}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Text
                    style={[styles.optionText, item === value && styles.optionTextActive]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>Няма съвпадение. Избери „Друга“.</Text>
              }
            />
            <Pressable
              style={styles.closeBtn}
              onPress={() => {
                setOpen(false);
                setQuery('');
              }}
            >
              <Text style={styles.closeText}>Затвори</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.peach,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: colors.chocolate,
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: colors.cocoa,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(90, 55, 34, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 3,
    borderColor: colors.caramel,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.chocolate,
    marginBottom: spacing.sm,
  },
  search: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.peach,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.chocolate,
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.peach,
  },
  optionActive: {
    backgroundColor: colors.softCream,
    borderRadius: 12,
  },
  optionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.cocoa,
  },
  optionTextActive: {
    color: colors.chocolate,
    fontFamily: 'Nunito_800ExtraBold',
  },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.pawBrown,
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.softOrange,
  },
});
