import { TextInput, View, Text } from "react-native";

interface PasteTextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}

export function PasteTextArea({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: PasteTextAreaProps) {
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8497b6"
        multiline
        textAlignVertical="top"
        allowFontScaling
        accessibilityLabel={accessibilityLabel}
        className="min-h-[220px] rounded-xl border border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-white p-4 text-base"
      />
      <Text className="text-xs text-navy-400 dark:text-navy-400 mt-2 text-right">
        {value.length} characters
      </Text>
    </View>
  );
}
