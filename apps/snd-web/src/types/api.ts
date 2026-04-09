export type DashboardPayload = {
  kpis: {
    simMtd: number;
    simDeltaPct: number;
    momoMtd: number;
    momoDeltaPct: number;
    activeDsas: number;
    floatAdequacyPct: number;
  };
  leaderboard: { r: number; a: string; ga: number; z: string }[];
  exceptions: { type: string; agent: string; st: string }[];
  floatAlerts: { a: string; bal: number; th: number; sev: string }[];
};

export type OrgNode = {
  id: string;
  name: string;
  level: string;
  children?: OrgNode[];
};

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  path: string;
  code: string;
  kyc: string;
  distributor: string;
  beat: string;
};

export type VisitRow = {
  id: string;
  userId: string;
  displayName: string;
  outlet: string;
  notes: string;
  at: string;
};
