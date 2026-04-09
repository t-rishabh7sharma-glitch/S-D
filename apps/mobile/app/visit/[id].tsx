import { useLocalSearchParams, Stack } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { outlets } from "../../data/mock";
import { colors, radii } from "../../theme";

const sh = Platform.select({
  ios: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
});

export default function VisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const outlet = outlets.find((o) => o.id === id) ?? outlets[0];

  return (
    <>
      <Stack.Screen options={{ title: outlet.name }} />
      <ScrollView style={s.screen} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          <Text style={s.bannerText}>
            Geo-fence: inside boundary (demo). Live photo must match outlet GPS in production.
          </Text>
        </View>

        <Text style={s.label}>Recruitment — KYC photo</Text>
        <Pressable style={({ pressed }) => [s.btnSecondary, pressed && s.pressed]}>
          <Text style={s.btnSecondaryText}>Open camera (demo)</Text>
        </Pressable>

        <Text style={s.label}>SIM registrations</Text>
        <TextInput
          style={s.input}
          placeholder="0"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
        />

        <Text style={s.label}>Float &amp; cash</Text>
        <TextInput
          style={s.input}
          placeholder="E-float balance"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
        />
        <View style={s.row}>
          <Text style={s.muted}>Physical cash adequate</Text>
          <Switch
            value
            onValueChange={() => {}}
            trackColor={{ false: colors.border, true: colors.primaryDim }}
            thumbColor={colors.card}
          />
        </View>

        <Text style={s.label}>Prospecting</Text>
        <Text style={s.mutedSmall}>Products pitched</Text>
        {["Data", "MoMo", "Devices"].map((p) => (
          <View key={p} style={s.row}>
            <Text style={s.ink}>{p}</Text>
            <Text style={s.muted}>Interest ▾</Text>
          </View>
        ))}

        <Text style={s.label}>Compliance &amp; intelligence</Text>
        {[
          "Zamtel branding visible",
          "Pricing compliant",
          "Competitor: MTN",
          "Competitor: Airtel",
          "Competitor: Zed Mobile",
          "Fraud flag (e.g. SIM boxing)",
        ].map((label) => (
          <View key={label} style={s.row}>
            <Text style={s.ink}>{label}</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primaryDim }}
              thumbColor={colors.card}
            />
          </View>
        ))}

        <Text style={s.label}>Proof of visit</Text>
        <Pressable style={({ pressed }) => [s.btnOutline, pressed && s.pressed]}>
          <Text style={s.btnOutlineText}>Take live geo-tagged photo</Text>
        </Pressable>
        <Text style={s.hint}>
          Submission blocked if photo GPS ≠ outlet within radius (configurable) — UI only here.
        </Text>

        <Pressable
          style={({ pressed }) => [s.submit, pressed && s.pressed]}
          onPress={() =>
            Alert.alert(
              "Visit submitted",
              "Demo only — in production this syncs to SND and triggers validation rules.",
            )
          }
        >
          <Text style={s.submitText}>Submit visit</Text>
        </Pressable>

        <Text style={s.offline}>
          Offline mode: manual location would be flagged for supervisor approval on sync.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: 20, paddingBottom: 48 },
  banner: {
    backgroundColor: colors.successBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.2)",
    padding: 12,
    marginBottom: 8,
    ...sh,
  },
  bannerText: { color: colors.success, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  label: {
    color: colors.navy,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 14,
    color: colors.ink,
    fontSize: 16,
    ...sh,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ink: { color: colors.ink, fontSize: 15, fontWeight: "500" },
  muted: { color: colors.muted, fontSize: 15 },
  mutedSmall: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  btnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: radii.md,
    alignItems: "center",
    ...sh,
  },
  btnSecondaryText: { color: colors.navy, fontWeight: "700", fontSize: 15 },
  btnOutline: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: radii.md,
    alignItems: "center",
    backgroundColor: colors.primaryDim,
  },
  btnOutlineText: { color: colors.navy, fontWeight: "800", fontSize: 15 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 10, lineHeight: 17 },
  submit: {
    marginTop: 28,
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: radii.lg,
    alignItems: "center",
    ...sh,
  },
  submitText: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  offline: { color: colors.warn, fontSize: 13, marginTop: 20, lineHeight: 19, fontWeight: "600" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
