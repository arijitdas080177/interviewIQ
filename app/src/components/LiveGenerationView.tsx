import { useRef } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";

/**
 * Strips the prompt's structural tags (<company_research>, <question>, ...)
 * for display purposes only — the raw text (tags included) is what's
 * actually parsed server-side once generation finishes. This is just to
 * keep the live preview readable while it streams in.
 */
function cleanForDisplay(raw: string): string {
  return raw
    .replace(/<\/?scratchpad>/gi, "")
    .replace(/<\/?[a-z_]+>/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function LiveGenerationView({ text, elapsedLabel }: { text: string; elapsedLabel: string }) {
  const scrollRef = useRef<ScrollView>(null);
  const display = cleanForDisplay(text);

  return (
    <View className="flex-1">
      <View className="flex-row items-center px-6 pt-2 pb-3">
        <ActivityIndicator size="small" />
        <Text className="ml-2 text-sm text-navy-500 dark:text-navy-300">
          Generating your report live — {elapsedLabel}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {display ? (
          <Text
            className="text-sm text-navy-700 dark:text-navy-100 leading-5"
            accessibilityLiveRegion="polite"
          >
            {display}
          </Text>
        ) : (
          <Text className="text-sm text-navy-400 dark:text-navy-400 italic">
            Waiting for the model to start generating...
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
