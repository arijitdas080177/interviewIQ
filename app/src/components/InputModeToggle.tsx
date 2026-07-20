import { View, Pressable, Text } from "react-native";
import type { InputMode } from "../state/intakeStore";

interface Option {
  mode: InputMode;
  label: string;
}

interface InputModeToggleProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
  includeLinkedIn?: boolean;
}

export function InputModeToggle({ value, onChange, includeLinkedIn }: InputModeToggleProps) {
  const options: Option[] = [
    { mode: "upload", label: "Upload a file" },
    { mode: "paste", label: "Paste text" },
    ...(includeLinkedIn ? [{ mode: "linkedin_url" as const, label: "Paste LinkedIn URL" }] : []),
  ];

  return (
    <View
      className="flex-row bg-navy-50 dark:bg-navy-800 rounded-xl p-1 mb-6"
      accessibilityRole="tablist"
    >
      {options.map((opt) => {
        const selected = value === opt.mode;
        return (
          <Pressable
            key={opt.mode}
            onPress={() => onChange(opt.mode)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            className={`flex-1 py-3 rounded-lg items-center justify-center ${
              selected ? "bg-white dark:bg-navy-600" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-medium text-center ${
                selected
                  ? "text-navy-900 dark:text-white"
                  : "text-navy-400 dark:text-navy-300"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
