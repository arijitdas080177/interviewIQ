import { Pressable, Text } from "react-native";

interface SkipButtonProps {
  onPress: () => void;
  label?: string;
}

export function SkipButton({ onPress, label = "I don't know yet — skip this step" }: SkipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center py-3 mt-3"
    >
      <Text className="text-navy-400 dark:text-navy-300 text-sm underline">{label}</Text>
    </Pressable>
  );
}
