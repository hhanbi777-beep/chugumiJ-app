import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** 여러 줄 메모 입력 */
  isMultiline?: boolean;
};

export function TextField({ label, isMultiline = false, ...inputProps }: TextFieldProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.root}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        multiline={isMultiline}
        placeholderTextColor={colors.textSecondary}
        style={[
          typography.body,
          styles.input,
          isMultiline && styles.multiline,
          { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs + 2 },
  input: {
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
