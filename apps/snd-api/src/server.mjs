import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import cors from "@fastify/cors";
import * as orgTree from "./orgTreeOps.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const storePath = path.join(dataDir, "store.json");
const seedPath = path.join(dataDir, "seed.json");

const PORT = Number(process.env.PORT || 4000);
const SECRET = process.env.SESSION_SECRET || "snd-dev-secret-change-in-prod";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    fs.writeFileSync(storePath, JSON.stringify(seed, null, 2), "utf8");
  }
}

function loadStore() {
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

function saveStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
}

function signToken(userId) {
  const payload = { sub: userId, exp: Date.now() + TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const exp = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(exp, "utf8");
  if (a.length !== b.length) return null;
  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
  return payload.sub;
}

function sessionFromRequest(req) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? verifyToken(m[1].trim()) : null;
}

function employeeById(store, userId) {
  return store.employees.find((e) => e.userId === userId) || null;
}

function publicSession(emp) {
  return {
    userId: emp.userId,
    roleKey: emp.roleKey,
    roleTitle: emp.roleTitle,
    displayName: emp.displayName,
    workspace: emp.workspace,
    loginAt: new Date().toISOString(),
  };
}

ensureStore();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ],
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
});

app.get("/api/health", async () => ({ ok: true }));

app.post("/api/auth/login", async (req, reply) => {
  const body = req.body || {};
  const id = String(body.employeeId || "")
    .trim()
    .toUpperCase();
  if (!id) {
    reply.code(400);
    return { error: "employeeId required" };
  }
  const store = loadStore();
  const emp = employeeById(store, id);
  if (!emp) {
    reply.code(401);
    return { error: "Invalid employee ID." };
  }
  const token = signToken(emp.userId);
  return { token, user: publicSession(emp) };
});

app.get("/api/auth/me", async (req, reply) => {
  const uid = sessionFromRequest(req);
  if (!uid) {
    reply.code(401);
    return { error: "Unauthorized" };
  }
  const store = loadStore();
  const emp = employeeById(store, uid);
  if (!emp) {
    reply.code(401);
    return { error: "Unauthorized" };
  }
  return { user: publicSession(emp) };
});

function requireBo(req, reply) {
  const uid = sessionFromRequest(req);
  if (!uid) {
    reply.code(401);
    return null;
  }
  const store = loadStore();
  const emp = employeeById(store, uid);
  if (!emp || emp.workspace !== "bo") {
    reply.code(403);
    return null;
  }
  return { uid, emp, store };
}

function requireBoAdmin(req, reply) {
  const ctx = requireBo(req, reply);
  if (!ctx) return null;
  if (ctx.emp.roleKey !== "ADMIN") {
    reply.code(403);
    return null;
  }
  return ctx;
}

function requireAgent(req, reply) {
  const uid = sessionFromRequest(req);
  if (!uid) {
    reply.code(401);
    return null;
  }
  const store = loadStore();
  const emp = employeeById(store, uid);
  if (!emp || emp.workspace !== "agent") {
    reply.code(403);
    return null;
  }
  return { uid, emp, store };
}

function requireAny(req, reply) {
  const uid = sessionFromRequest(req);
  if (!uid) {
    reply.code(401);
    return null;
  }
  const store = loadStore();
  const emp = employeeById(store, uid);
  if (!emp) {
    reply.code(401);
    return null;
  }
  return { uid, emp, store };
}

app.get("/api/bo/dashboard", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const { store } = ctx;
  return {
    kpis: store.dashboardKpis,
    leaderboard: store.leaderboard,
    exceptions: store.exceptions,
    floatAlerts: store.floatAlerts,
  };
});

app.get("/api/bo/org-tree", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { tree: ctx.store.orgTree };
});

app.post("/api/bo/org-tree/node", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const parentId = String(b.parentId || "").trim();
  const name = b.name;
  const level = b.level;
  if (!parentId) {
    reply.code(400);
    return { error: "parentId required" };
  }
  const store = loadStore();
  const r = orgTree.addChild(store.orgTree, parentId, { name, level });
  if (r.error) {
    reply.code(400);
    return { error: r.error };
  }
  saveStore(store);
  return { tree: store.orgTree };
});

app.patch("/api/bo/org-tree/node/:id", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const b = req.body || {};
  const store = loadStore();
  const r = orgTree.updateNode(store.orgTree, id, { name: b.name, level: b.level });
  if (r.error) {
    reply.code(400);
    return { error: r.error };
  }
  saveStore(store);
  return { tree: store.orgTree };
});

app.delete("/api/bo/org-tree/node/:id", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const store = loadStore();
  const r = orgTree.removeNode(store.orgTree, id);
  if (r.error) {
    reply.code(400);
    return { error: r.error };
  }
  saveStore(store);
  return { tree: store.orgTree };
});

app.post("/api/bo/org-tree/node/:id/move-up", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const store = loadStore();
  const r = orgTree.moveSibling(store.orgTree, id, "up");
  if (r.error) {
    reply.code(400);
    return { error: r.error };
  }
  saveStore(store);
  return { tree: store.orgTree };
});

app.post("/api/bo/org-tree/node/:id/move-down", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const store = loadStore();
  const r = orgTree.moveSibling(store.orgTree, id, "down");
  if (r.error) {
    reply.code(400);
    return { error: r.error };
  }
  saveStore(store);
  return { tree: store.orgTree };
});

app.get("/api/bo/users", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { users: ctx.store.directory };
});

app.post("/api/bo/users", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) {
    reply.code(400);
    return { error: "name required" };
  }
  const store = loadStore();
  const id = `u-${crypto.randomUUID().slice(0, 8)}`;
  const row = {
    id,
    name,
    email: String(b.email || "").trim() || "—",
    role: String(b.role || "DSA").trim().toUpperCase(),
    path: String(b.path || "").trim() || "—",
    code: String(b.code || "").trim() || "—",
    kyc: String(b.kyc || "PENDING").trim().toUpperCase(),
    distributor: String(b.distributor || "").trim() || "—",
    beat: String(b.beat || "").trim() || "—",
  };
  store.directory.push(row);
  saveStore(store);
  reply.code(201);
  return { users: store.directory };
});

app.patch("/api/bo/users/:id", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const b = req.body || {};
  const store = loadStore();
  const i = store.directory.findIndex((u) => u.id === id);
  if (i < 0) {
    reply.code(404);
    return { error: "User not found" };
  }
  const u = store.directory[i];
  store.directory[i] = {
    ...u,
    name: b.name !== undefined ? String(b.name).trim() : u.name,
    email: b.email !== undefined ? String(b.email).trim() : u.email,
    role: b.role !== undefined ? String(b.role).trim().toUpperCase() : u.role,
    path: b.path !== undefined ? String(b.path).trim() : u.path,
    code: b.code !== undefined ? String(b.code).trim() : u.code,
    kyc: b.kyc !== undefined ? String(b.kyc).trim().toUpperCase() : u.kyc,
    distributor: b.distributor !== undefined ? String(b.distributor).trim() : u.distributor,
    beat: b.beat !== undefined ? String(b.beat).trim() : u.beat,
  };
  saveStore(store);
  return { users: store.directory };
});

app.delete("/api/bo/users/:id", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const id = String(req.params.id || "").trim();
  const store = loadStore();
  const before = store.directory.length;
  store.directory = store.directory.filter((u) => u.id !== id);
  if (store.directory.length === before) {
    reply.code(404);
    return { error: "User not found" };
  }
  saveStore(store);
  return { users: store.directory };
});

app.get("/api/bo/kpis", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { kpis: ctx.store.kpis };
});

app.post("/api/bo/kpis", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) {
    reply.code(400);
    return { error: "name required" };
  }
  const store = loadStore();
  store.kpis.push({
    name,
    unit: String(b.unit || "count").trim(),
    freq: String(b.freq || "MONTHLY").trim().toUpperCase(),
    formula: String(b.formula || "").trim() || "—",
  });
  saveStore(store);
  reply.code(201);
  return { kpis: store.kpis };
});

app.patch("/api/bo/kpis/:idx", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const idx = Number.parseInt(String(req.params.idx), 10);
  const store = loadStore();
  if (!Number.isFinite(idx) || idx < 0 || idx >= store.kpis.length) {
    reply.code(404);
    return { error: "KPI not found" };
  }
  const b = req.body || {};
  const k = store.kpis[idx];
  store.kpis[idx] = {
    name: b.name !== undefined ? String(b.name).trim() : k.name,
    unit: b.unit !== undefined ? String(b.unit).trim() : k.unit,
    freq: b.freq !== undefined ? String(b.freq).trim().toUpperCase() : k.freq,
    formula: b.formula !== undefined ? String(b.formula).trim() : k.formula,
  };
  saveStore(store);
  return { kpis: store.kpis };
});

app.delete("/api/bo/kpis/:idx", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const idx = Number.parseInt(String(req.params.idx), 10);
  const store = loadStore();
  if (!Number.isFinite(idx) || idx < 0 || idx >= store.kpis.length) {
    reply.code(404);
    return { error: "KPI not found" };
  }
  store.kpis.splice(idx, 1);
  saveStore(store);
  return { kpis: store.kpis };
});

app.get("/api/bo/targets/current", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { campaign: ctx.store.targetCampaign };
});

app.patch("/api/bo/targets/current", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const store = loadStore();
  const c = store.targetCampaign;
  if (b.name !== undefined) c.name = String(b.name).trim() || c.name;
  if (b.method !== undefined) c.method = String(b.method).trim() || c.method;
  if (b.status !== undefined) c.status = String(b.status).trim().toUpperCase() || c.status;
  if (Array.isArray(b.rows)) {
    c.rows = b.rows.map((r) => ({
      node: String(r.node || "").trim() || "—",
      amount: Number(r.amount) || 0,
      pct: typeof r.pct === "number" ? r.pct : Number(r.pct) || 0,
    }));
  }
  if (b.total !== undefined && b.total !== null) {
    c.total = Number(b.total) || 0;
  } else if (Array.isArray(b.rows)) {
    c.total = c.rows.reduce((s, r) => s + r.amount, 0);
  }
  saveStore(store);
  return { campaign: store.targetCampaign };
});

app.get("/api/bo/incentives", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { incentives: ctx.store.incentives };
});

app.get("/api/bo/rbac", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return { rows: ctx.store.rbac };
});

app.get("/api/bo/territory", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return {
    summary: ctx.store.territorySummary,
    beats: ctx.store.beats,
  };
});

app.patch("/api/bo/territory", async (req, reply) => {
  const ctx = requireBoAdmin(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const store = loadStore();
  if (b.summary && typeof b.summary === "object") {
    const s = b.summary;
    if (s.path !== undefined) store.territorySummary.path = String(s.path).trim();
    if (s.beatsNote !== undefined) store.territorySummary.beatsNote = String(s.beatsNote).trim();
  }
  if (Array.isArray(b.beats)) {
    store.beats = b.beats.map((x) => ({
      user: String(x.user || "").trim() || "—",
      beat: String(x.beat || "").trim() || "—",
      active: Boolean(x.active),
    }));
  }
  saveStore(store);
  return {
    summary: store.territorySummary,
    beats: store.beats,
  };
});

app.get("/api/bo/reports", async (req, reply) => {
  const ctx = requireBo(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  return {
    heatmap: ctx.store.heatmap,
    trend: ctx.store.trend,
  };
});

app.post("/api/field/visits", async (req, reply) => {
  const ctx = requireAgent(req, reply);
  if (!ctx) return reply.send({ error: "Forbidden" });
  const b = req.body || {};
  const outlet = String(b.outlet || "").trim() || "Unknown outlet";
  const notes = String(b.notes || "").trim();
  const store = loadStore();
  const visit = {
    id: crypto.randomUUID(),
    userId: ctx.uid,
    displayName: ctx.emp.displayName,
    outlet,
    notes,
    at: new Date().toISOString(),
  };
  store.visits = store.visits || [];
  store.visits.unshift(visit);
  saveStore(store);
  reply.code(201);
  return { visit };
});

app.get("/api/field/visits", async (req, reply) => {
  const ctx = requireAny(req, reply);
  if (!ctx) return reply.send({ error: "Unauthorized" });
  const store = loadStore();
  const list = store.visits || [];
  if (ctx.emp.workspace === "agent") {
    return { visits: list.filter((v) => v.userId === ctx.uid) };
  }
  if (ctx.emp.workspace === "bo") {
    return { visits: list };
  }
  reply.code(403);
  return reply.send({ error: "Forbidden" });
});

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`SND API http://127.0.0.1:${PORT}  (store: ${storePath})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
