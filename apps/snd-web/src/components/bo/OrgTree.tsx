import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { OrgNode } from "@/types/api";

export function findOrgNode(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  for (const ch of root.children || []) {
    const f = findOrgNode(ch, id);
    if (f) return f;
  }
  return null;
}

function Row({
  level,
  name,
  depth,
  children,
  hasKids,
  open,
  onToggle,
  editable,
  selected,
  onSelectRow,
}: {
  level: string;
  name: string;
  depth: number;
  children?: ReactNode;
  hasKids: boolean;
  open: boolean;
  onToggle: () => void;
  editable: boolean;
  selected: boolean;
  onSelectRow: () => void;
}) {
  const pad = 8 + depth * 14;
  if (!editable) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-2 rounded-lg py-2 pl-2 text-left text-sm transition-colors hover:bg-slate-50"
          style={{ paddingLeft: pad }}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-muted">
            {hasKids ? (
              open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            {level}
          </span>
          <span className="font-semibold text-ink">{name}</span>
        </button>
        {hasKids && open ? <div className="border-l border-slate-100 ml-[21px]">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className="select-none">
      <div
        className="flex w-full items-center gap-1 rounded-lg py-2 pl-2 text-left text-sm"
        style={{ paddingLeft: pad }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-slate-100"
          aria-label={hasKids ? (open ? "Collapse" : "Expand") : "Leaf"}
        >
          {hasKids ? (
            open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </button>
        <button
          type="button"
          onClick={onSelectRow}
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pr-2 text-left transition-colors hover:bg-slate-50 ${
            selected ? "bg-primary/8 ring-2 ring-primary/40" : ""
          }`}
        >
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            {level}
          </span>
          <span className="truncate font-semibold text-ink">{name}</span>
        </button>
      </div>
      {hasKids && open ? <div className="border-l border-slate-100 ml-[21px]">{children}</div> : null}
    </div>
  );
}

function NodeView({
  node,
  depth,
  editable,
  selectedId,
  onSelect,
}: {
  node: OrgNode;
  depth: number;
  editable: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const kids = node.children?.length ? node.children : [];
  return (
    <Row
      level={node.level}
      name={node.name}
      depth={depth}
      hasKids={kids.length > 0}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      editable={editable}
      selected={selectedId === node.id}
      onSelectRow={() => onSelect(node.id)}
    >
      {kids.map((c) => (
        <NodeView
          key={c.id}
          node={c}
          depth={depth + 1}
          editable={editable}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </Row>
  );
}

type OrgTreeProps = {
  root: OrgNode;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function OrgTree({ root, editable = false, selectedId = null, onSelect }: OrgTreeProps) {
  const sel = selectedId;
  const pick = onSelect ?? (() => {});
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-card">
      <NodeView
        node={root}
        depth={0}
        editable={editable}
        selectedId={sel}
        onSelect={pick}
      />
    </div>
  );
}
