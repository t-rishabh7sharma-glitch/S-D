export const agentHero = {
  displayName: "Chanda",
  name: "Chanda Mwansa",
  slab: "Tier 2 — 3.5%",
  pendingBonus: "K 120",
  nextTier: "5%",
  actionsDone: 67,
  actionsNeeded: 100,
  actionLabel: "SIM regs this month",
};

export const dailyTasks = [
  { id: "t1", title: "Planned route", subtitle: "8 outlets · CB-01", tint: "#00BAF2" },
  { id: "t2", title: "Pending KYC", subtitle: "2 uploads awaiting review", tint: "#002970" },
  { id: "t3", title: "Prospect follow-ups", subtitle: "5 warm leads", tint: "#6366F1" },
  { id: "t4", title: "Compliance checks", subtitle: "Pricing & branding", tint: "#8B5CF6" },
];

export const checkInDemo = {
  ts: "2026-04-08 18:06",
  lat: -15.4167,
  lng: 28.2833,
  readonly: true,
};

export const outlets = [
  { id: "o1", name: "CBD Outlet Alpha", code: "OUT-001", distanceM: 45 },
  { id: "o2", name: "Soweto Kiosk", code: "OUT-014", distanceM: 890 },
];

export const supervisor = {
  routeSummary: { planned: 42, actual: 38, team: "Team Alpha" },
  exceptions: [
    { id: "e1", type: "Geo-fence override", who: "Bwalya K.", status: "OPEN" },
    { id: "e2", type: "Offline manual sync", who: "Chanda M.", status: "PENDING" },
  ],
  floatAlerts: [
    { who: "Bwalya K.", bal: 120, threshold: 500 },
    { who: "Mutinta S.", bal: 380, threshold: 500 },
  ],
  acquisition: { ga: 412, momoGa: 198, conv: 0.34 },
  dormancy: ["Joseph M.", "Peter N."],
  leaderboard: [
    { rank: 1, name: "Chanda M.", ga: 412 },
    { rank: 2, name: "Mutinta S.", ga: 398 },
  ],
};
