import "../src/theme/global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme } from "nativewind";
import { getToken } from "../src/api/authToken";
import { useAuthStore } from "../src/state/authStore";

export default function RootLayout() {
  const scheme = useColorScheme();
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // We only persist a JWT, not the user profile, so on cold start we can't
    // know if it's still valid without a request — screens that need auth
    // handle a 401 by routing back to login. This just unblocks the
    // "isHydrated" gate so the initial route can render.
    getToken().then(() => setHydrated());
  }, [setHydrated, setUser]);

  useEffect(() => {
    // NativeWind's "class" dark-mode strategy doesn't auto-follow the OS
    // preference on its own (that's what "media" mode is for) — it needs an
    // explicit sync, which this keeps up to date via react-native's
    // useColorScheme() re-rendering on Appearance changes.
    nativewindColorScheme.set(scheme === "dark" ? "dark" : "light");
  }, [scheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
