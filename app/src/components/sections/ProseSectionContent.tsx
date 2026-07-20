import { View, Text } from "react-native";

export function ProseSectionContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return (
    <View>
      {paragraphs.map((para, i) => (
        <Text key={i} className="text-sm text-navy-700 dark:text-navy-100 leading-5 mb-3">
          {para.trim()}
        </Text>
      ))}
    </View>
  );
}
