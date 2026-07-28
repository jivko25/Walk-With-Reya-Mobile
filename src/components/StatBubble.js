import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function StatBubble({ emoji, label, value }) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.caramel,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 96,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.chocolate,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.cocoa,
    marginTop: 2,
    textAlign: 'center',
  },
});
