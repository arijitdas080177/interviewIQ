import { useState, type PropsWithChildren } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

interface AccordionSectionProps {
  id: string;
  title: string;
  preview: string;
  defaultExpanded?: boolean;
}

export function AccordionSection({
  id,
  title,
  preview,
  defaultExpanded,
  children,
}: PropsWithChildren<AccordionSectionProps>) {
  const [expanded, setExpanded] = useState(!!defaultExpanded);

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      className="border border-navy-100 dark:border-navy-700 rounded-2xl mb-3 overflow-hidden bg-white dark:bg-navy-800"
      nativeID={id}
    >
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded ? `${title}, expanded` : `${title}, collapsed. ${preview}`
        }
        importantForAccessibility="no-hide-descendants"
        className="px-5 py-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-navy-900 dark:text-white flex-1 mr-2">
            {title}
          </Text>
          <Text className="text-navy-400 dark:text-navy-300 text-lg">{expanded ? "–" : "+"}</Text>
        </View>
        {!expanded ? (
          <Text
            numberOfLines={1}
            className="text-sm text-navy-400 dark:text-navy-400 mt-1"
          >
            {preview}
          </Text>
        ) : null}
      </Pressable>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="px-5 pb-5"
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
