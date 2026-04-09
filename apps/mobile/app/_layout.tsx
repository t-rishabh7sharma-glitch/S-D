import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card, elevation: 0 },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: "800", color: colors.ink },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="visit/[id]" options={{ title: "Visit log" }} />
      </Stack>
    </>
  );
}
