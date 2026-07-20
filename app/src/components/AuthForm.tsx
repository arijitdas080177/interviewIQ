import { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { PrimaryButton } from "./PrimaryButton";
import { setToken } from "../api/authToken";
import { useAuthStore } from "../state/authStore";
import { api, ApiError } from "../api/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const result = isSignup
        ? await api.signup(email.trim(), password)
        : await api.login(email.trim(), password);
      await setToken(result.token);
      setUser(result.user);
      router.replace("/(intake)/resume");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <View className="flex-1 bg-white dark:bg-navy-900 px-6 pt-24 justify-center">
        <Text
          className="text-3xl font-bold text-navy-900 dark:text-white mb-2"
          accessibilityRole="header"
        >
          InterviewIQ
        </Text>
        <Text className="text-base text-navy-500 dark:text-navy-300 mb-8">
          {isSignup ? "Create an account to start prepping." : "Welcome back."}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#8497b6"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          accessibilityLabel="Email address"
          className="rounded-xl border border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-white p-4 text-base mb-3"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8497b6"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isSignup ? "new-password" : "password"}
          accessibilityLabel="Password"
          className="rounded-xl border border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-white p-4 text-base mb-3"
        />

        {error ? (
          <Text className="text-red-600 dark:text-red-300 text-sm mb-3" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          label={isSignup ? "Sign up" : "Log in"}
          onPress={handleSubmit}
          loading={submitting}
        />

        <Pressable
          onPress={() => router.replace(isSignup ? "/(auth)/login" : "/(auth)/signup")}
          accessibilityRole="button"
          className="items-center py-4"
        >
          <Text className="text-navy-500 dark:text-navy-300 text-sm">
            {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
