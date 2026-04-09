import crypto from "node:crypto";

export function findNode(root, id) {
  if (root.id === id) return root;
  for (const ch of root.children || []) {
    const f = findNode(ch, id);
    if (f) return f;
  }
  return null;
}

export function findParent(root, childId) {
  for (const ch of root.children || []) {
    if (ch.id === childId) return root;
    const p = findParent(ch, childId);
    if (p) return p;
  }
  return null;
}

export function addChild(root, parentId, { name, level }) {
  const p = findNode(root, parentId);
  if (!p) return { error: "Parent not found" };
  const n = String(name || "").trim();
  const lv = String(level || "").trim().toUpperCase();
  if (!n) return { error: "Name required" };
  if (!lv) return { error: "Level required" };
  if (!p.children) p.children = [];
  const id = `n-${crypto.randomUUID().slice(0, 8)}`;
  p.children.push({ id, name: n, level: lv, children: [] });
  return { ok: true, id };
}

export function removeNode(root, id) {
  if (root.id === id) return { error: "Cannot delete root" };
  const parent = findParent(root, id);
  if (!parent?.children) return { error: "Node not found" };
  const idx = parent.children.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Node not found" };
  const node = parent.children[idx];
  if (node.children?.length) return { error: "Remove or move child nodes first" };
  parent.children.splice(idx, 1);
  return { ok: true };
}

export function updateNode(root, id, { name, level }) {
  const n = findNode(root, id);
  if (!n) return { error: "Not found" };
  if (name != null) n.name = String(name).trim();
  if (level != null) n.level = String(level).trim().toUpperCase();
  return { ok: true };
}

export function moveSibling(root, id, dir) {
  const parent = findParent(root, id);
  if (!parent?.children) return { error: "No parent" };
  const i = parent.children.findIndex((c) => c.id === id);
  if (i < 0) return { error: "Not found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= parent.children.length) return { error: dir === "up" ? "Already first" : "Already last" };
  const t = parent.children[j];
  parent.children[j] = parent.children[i];
  parent.children[i] = t;
  return { ok: true };
}

export function reorderChildren(root, parentId, orderedIds) {
  const parent = findNode(root, parentId);
  if (!parent?.children) return { error: "Parent not found" };
  const map = new Map(parent.children.map((c) => [c.id, c]));
  const next = orderedIds.map((i) => map.get(i)).filter(Boolean);
  if (next.length !== parent.children.length) return { error: "Invalid order — must list all children" };
  parent.children = next;
  return { ok: true };
}
