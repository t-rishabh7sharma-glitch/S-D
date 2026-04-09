import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { supervisor } from "../../data/mock";
import { colors, radii } from "../../theme";

const sh = Platform.select({
  ios: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
});

export default function SuperviseScreen() {
  const { routeSummary, exceptions, floatAlerts, acquisition, dormancy, leaderboard } = supervisor;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
      <Text style={s.h1}>Supervisor cockpit</Text>
      <Text style={s.sub}>TL · ASE · TDR · ZBM — demo data only</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Route tracking</Text>
        <Text style={s.row}>
          Team: <Text style={s.bold}>{routeSummary.team}</Text>
        </Text>
        <Text style={s.row}>
          Planned visits: <Text style={s.accent}>{routeSummary.planned}</Text> · Actual:{" "}
          <Text style={s.accent}>{routeSummary.actual}</Text>
        </Text>
      </View>

      <Text style={s.section}>Exceptions</Text>
      {exceptions.map((e) => (
        <View key={e.id} style={s.rowCard}>
          <Text style={s.bold}>{e.type}</Text>
          <Text style={s.muted}>
            {e.who} · {e.status}
          </Text>
        </View>
      ))}

      <Text style={s.section}>Float stockout alerts</Text>
      {floatAlerts.map((f, i) => (
        <View key={i} style={[s.rowCard, s.warnCard]}>
          <Text style={s.bold}>{f.who}</Text>
          <Text style={s.muted}>
            Balance K {f.bal} / threshold {f.threshold}
          </Text>
        </View>
      ))}

      <Text style={s.section}>Customer acquisition</Text>
      <View style={s.card}>
        <Text style={s.row}>Gross additions: {acquisition.ga}</Text>
        <Text style={s.row}>MoMo GA: {acquisition.momoGa}</Text>
        <Text style={s.row}>Conversion (leads→act): {(acquisition.conv * 100).toFixed(0)}%</Text>
      </View>

      <Text style={s.section}>Non-visiting agents (dormancy)</Text>
      {dormancy.map((n) => (
        <Text key={n} style={s.mutedRow}>
          · {n}
        </Text>
      ))}

      <Text style={s.section}>Leaderboard (your scope)</Text>
      {leaderboard.map((r) => (
        <View key={r.rank} style={s.rowCard}>
          <Text style={s.leadRow}>
            <Text style={s.rank}>#{r.rank}</Text>
            {` ${r.name} — ${r.ga} GA`}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: 20, paddingBottom: 36 },
  h1: { color: colors.navy, fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  sub: { color: colors.muted, marginTop: 8, marginBottom: 18, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    ...sh,
  },
  cardTitle: { color: colors.navy, fontWeight: "800", marginBottom: 10, fontSize: 15 },
  row: { color: colors.muted, marginTop: 6, fontSize: 15 },
  bold: { color: colors.ink, fontWeight: "700" },
  accent: { color: colors.primary, fontWeight: "800" },
  section: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  rowCard: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    ...sh,
  },
  warnCard: { borderColor: "rgba(217, 119, 6, 0.35)", backgroundColor: colors.warnBg },
  muted: { color: colors.muted, marginTop: 6, fontSize: 13 },
  mutedRow: { color: colors.muted, marginBottom: 6, fontSize: 14 },
  leadRow: { color: colors.ink, fontSize: 15, fontWeight: "600" },
  rank: { color: colors.primary, fontWeight: "800" },
});
