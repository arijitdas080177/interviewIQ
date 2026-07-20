import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { getToken } from "../src/api/authToken";
import { useIntakeStore, furthestIncompleteStep, intakeStepRoute } from "../src/state/intakeStore";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const intakeState = useIntakeStore();

  useEffect(() => {
    getToken().then((token) => {
      setHasToken(!!token);
      setChecking(false);
    });
  }, []);

  if (checking || !intakeState.hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-navy-900">
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasToken) return <Redirect href="/(auth)/login" />;

  // Resume wherever the user left off, rather than always restarting at
  // step 1 — this is what makes "kill the app mid-intake" safe.
  return <Redirect href={intakeStepRoute(furthestIncompleteStep(intakeState)) as never} />;
}
