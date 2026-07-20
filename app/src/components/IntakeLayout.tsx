import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import type { PropsWithChildren } from "react";
import { INTAKE_STEPS, intakeStepRoute, type IntakeStep } from "../state/intakeStore";

interface IntakeLayoutProps {
  step: IntakeStep;
  title: string;
  prompt: string;
  canGoBack?: boolean;
}

export function IntakeLayout({
  step,
  title,
  prompt,
  canGoBack = true,
  children,
}: PropsWithChildren<IntakeLayoutProps>) {
  const router = useRouter();
  const stepIndex = INTAKE_STEPS.indexOf(step);
  const stepNumber = stepIndex + 1;
  const total = INTAKE_STEPS.length;

  function handleBack() {
    // Landing directly on a later step (e.g. resuming mid-flow after an app
    // restart) means there's no navigation history to pop, so router.back()
    // silently fails in that case — fall back to navigating to the previous
    // step directly.
    if (router.canGoBack()) {
      router.back();
    } else if (stepIndex > 0) {
      router.replace(intakeStepRoute(INTAKE_STEPS[stepIndex - 1]) as never);
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-navy-900 px-6 pt-16">
      <View className="flex-row items-center mb-6">
        {canGoBack && stepIndex > 0 ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous step"
            className="mr-3 py-1 pr-2"
            hitSlop={12}
          >
            <Text className="text-navy-600 dark:text-navy-200 text-2xl">‹</Text>
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text
            className="text-xs font-medium text-navy-400 dark:text-navy-300 mb-2"
            accessibilityLabel={`Step ${stepNumber} of ${total}`}
          >
            STEP {stepNumber} OF {total}
          </Text>
          <View className="flex-row gap-1.5" accessibilityElementsHidden importantForAccessibility="no">
            {INTAKE_STEPS.map((s, i) => (
              <View
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= stepIndex ? "bg-navy-800 dark:bg-gold-500" : "bg-navy-100 dark:bg-navy-700"
                }`}
              />
            ))}
          </View>
        </View>
      </View>

      <Animated.View
        entering={FadeInRight.duration(240)}
        exiting={FadeOutLeft.duration(150)}
        className="flex-1"
      >
        <Text
          className="text-2xl font-bold text-navy-900 dark:text-white mb-2"
          accessibilityRole="header"
        >
          {title}
        </Text>
        <Text className="text-base text-navy-500 dark:text-navy-300 mb-8">{prompt}</Text>

        {children}
      </Animated.View>
    </View>
  );
}
