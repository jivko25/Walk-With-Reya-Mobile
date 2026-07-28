import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function PawButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primary,
        isDanger && styles.danger,
        variant === 'secondary' && styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>
        {title}
      </Text>
      <View style={styles.pawRow}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.paw}>🐾</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.chocolate,
    shadowColor: colors.chocolate,
    shadowOpacity: 0.2,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primary: {
    backgroundColor: colors.softOrange,
  },
  danger: {
    backgroundColor: colors.warmCoral,
  },
  secondary: {
    backgroundColor: colors.softCream,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: colors.chocolate,
    textAlign: 'center',
  },
  secondaryLabel: {
    color: colors.cocoa,
  },
  pawRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  paw: {
    fontSize: 14,
  },
});
