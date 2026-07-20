import { Pressable, Text, ActivityIndicator } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  accessibilityHint,
}: PrimaryButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      className={`items-center justify-center rounded-xl py-4 px-6 ${
        isPrimary ? "bg-navy-800 dark:bg-navy-100" : "bg-transparent border border-navy-200 dark:border-navy-600"
      } ${disabled || loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#ffffff" : "#1f2f4d"} />
      ) : (
        <Text
          className={`text-base font-semibold ${
            isPrimary ? "text-white dark:text-navy-900" : "text-navy-800 dark:text-navy-100"
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
