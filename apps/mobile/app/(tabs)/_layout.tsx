import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "../../theme";

function FieldHeaderTitle() {
  return (
    <View style={hs.wrap}>
      <Text style={hs.title}>S&amp;D Field</Text>
      <Text style={hs.sub}>DSA-101 · Direct Sales Agent</Text>
    </View>
  );
}

function SuperviseHeaderTitle() {
  return (
    <View style={hs.wrap}>
      <Text style={hs.title}>Supervise</Text>
      <Text style={hs.sub}>Team Alpha · TL view</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navy,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: "#fff",
        headerTitleAlign: "left",
        headerRight: () => (
          <Pressable
            onPress={() => Alert.alert("Demo build", "Sign-out hooks to your auth provider in production.")}
            style={hs.signOutWrap}
            hitSlop={12}
          >
            <Text style={hs.signOut}>Sign out</Text>
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 12,
          shadowColor: colors.navy,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Field",
          headerTitle: () => <FieldHeaderTitle />,
          tabBarLabel: "Field",
        }}
      />
      <Tabs.Screen
        name="supervise"
        options={{
          title: "Supervise",
          headerTitle: () => <SuperviseHeaderTitle />,
          tabBarLabel: "Supervise",
        }}
      />
    </Tabs>
  );
}

const hs = StyleSheet.create({
  wrap: { justifyContent: "center", paddingVertical: 4 },
  title: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  sub: { color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 2, fontWeight: "500" },
  signOutWrap: { marginRight: 4, paddingVertical: 8, paddingHorizontal: 4 },
  signOut: { color: "rgba(255,255,255,0.92)", fontSize: 15, fontWeight: "600" },
});
