import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View
        style={[
          { flex: 1, backgroundColor: colors.surface },
          Platform.OS === "web" && ({ minHeight: "100vh" } as const),
        ]}
      >
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card, elevation: 0 },
            headerTintColor: colors.navy,
            headerTitleStyle: { fontWeight: "800", color: colors.ink },
            headerShadowVisible: false,
            contentStyle: { flex: 1, backgroundColor: colors.surface },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="visit/[id]" options={{ title: "Visit log" }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
