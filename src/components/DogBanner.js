import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function DogBanner({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.bones}>🦴  🐩  🦴</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  bones: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: colors.chocolate,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.cocoa,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
});
