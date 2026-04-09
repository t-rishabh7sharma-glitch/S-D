import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { agentHero, dailyTasks, checkInDemo, outlets } from "../../data/mock";
import { colors, radii } from "../../theme";

export default function AgentHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const CARD_W = Math.max(280, width - 40);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const pct = Math.min(100, Math.round((agentHero.actionsDone / agentHero.actionsNeeded) * 100));

  const refresh =
    Platform.OS === "web" ? undefined : (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />
    );

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.pad, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={refresh}
    >
      <Text style={s.kicker}>Check-in (auto)</Text>
      <View style={s.checkIn}>
        <Text style={s.checkInMono}>
          {checkInDemo.ts} · {checkInDemo.lat.toFixed(4)}, {checkInDemo.lng.toFixed(4)}
        </Text>
        <Text style={s.checkInHint}>
          Timestamp &amp; GPS are read-only in production · demo values shown
        </Text>
      </View>

      <View style={s.hero}>
        <Text style={s.heroEyebrow}>Performance &amp; payout</Text>
        <Text style={s.heroName}>{agentHero.displayName}</Text>
        <Text style={s.heroLine}>
          Current slab: <Text style={s.heroAccent}>{agentHero.slab}</Text>
        </Text>
        <Text style={s.heroMuted}>
          Pending bonus: {agentHero.pendingBonus} · Next tier: {agentHero.nextTier}
        </Text>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={s.progress}>
          {agentHero.actionsDone} / {agentHero.actionsNeeded} {agentHero.actionLabel}
        </Text>
      </View>

      <Text style={s.section}>Today&apos;s tasks</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        contentContainerStyle={s.carousel}
      >
        {dailyTasks.map((t) => (
          <View key={t.id} style={[s.taskCard, { width: CARD_W, borderLeftColor: t.tint }]}>
            <Text style={s.taskTitle}>{t.title}</Text>
            <Text style={s.taskSub}>{t.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={s.carouselDots}>
        {dailyTasks.map((t, i) => (
          <View key={t.id} style={[s.dot, i === 0 ? s.dotOn : s.dotOff]} />
        ))}
      </View>

      <Text style={s.section}>Outlets</Text>
      {outlets.map((o) => (
        <Pressable
          key={o.id}
          accessibilityRole="button"
          onPress={() => router.push(`/visit/${o.id}`)}
          style={({ pressed }) => [s.outlet, pressed && s.outletPressed]}
        >
          <View style={s.outletIcon}>
            <Text style={s.outletIconText}>{o.name.charAt(0)}</Text>
          </View>
          <View style={s.outletBody}>
            <Text style={s.outletName}>{o.name}</Text>
            <Text style={s.outletMeta}>
              {o.code} · {o.distanceM}m
            </Text>
          </View>
          <Text style={s.visitCta}>Visit →</Text>
        </Pressable>
      ))}

      {Platform.OS === "web" ? (
        <Text style={s.webNote}>
          Field agent preview. Back Office (dashboard, hierarchy, targets, RBAC) is the separate SND web app — not this
          deploy.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: 20, paddingBottom: 36 },
  kicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  checkIn: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 18,
    ...shadow,
  },
  checkInMono: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  checkInHint: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 17 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 22,
    ...shadow,
  },
  heroEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: -0.5,
  },
  heroLine: { color: colors.ink, marginTop: 10, fontSize: 15, fontWeight: "500" },
  heroAccent: { color: colors.primary, fontWeight: "800" },
  heroMuted: { color: colors.muted, marginTop: 8, fontSize: 14, lineHeight: 20 },
  barTrack: {
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  barFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  progress: { color: colors.muted, fontSize: 13, marginTop: 10, fontWeight: "600" },
  section: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  carousel: { gap: 12, paddingRight: 20 },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 16,
    paddingLeft: 14,
    minHeight: 108,
    ...shadow,
  },
  taskTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  taskSub: { color: colors.muted, marginTop: 8, fontSize: 14, lineHeight: 20 },
  carouselDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: { backgroundColor: colors.primary, width: 20, borderRadius: 3 },
  dotOff: { backgroundColor: colors.border },
  outlet: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    ...shadow,
  },
  outletPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  outletIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  outletIconText: { color: colors.navy, fontSize: 18, fontWeight: "800" },
  outletBody: { flex: 1, minWidth: 0 },
  outletName: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  outletMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  visitCta: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  webNote: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
