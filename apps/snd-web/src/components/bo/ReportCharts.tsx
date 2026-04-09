type Heat = { t: string; sim: number; momo: number; fl: number };
type Trend = { m: string; tgt: number; act: number };

export function HeatmapChart({ data }: { data: Heat[] }) {
  return (
    <div>
      <div className="mb-2 flex gap-4 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-primary" /> SIM
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-navy" /> MoMo
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-400" /> Float
        </span>
      </div>
      <div className="flex h-40 items-end justify-between gap-3 border-b border-slate-100 pb-1">
        {data.map((h) => (
          <div key={h.t} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full max-w-[52px] items-end justify-center gap-0.5">
              <div
                className="w-2 rounded-t bg-primary/90"
                style={{ height: `${h.sim}%` }}
                title={`SIM ${h.sim}%`}
              />
              <div
                className="w-2 rounded-t bg-navy/85"
                style={{ height: `${h.momo}%` }}
                title={`MoMo ${h.momo}%`}
              />
              <div
                className="w-2 rounded-t bg-amber-400/90"
                style={{ height: `${h.fl}%` }}
                title={`Float ${h.fl}%`}
              />
            </div>
            <span className="text-center text-[11px] font-semibold text-ink-secondary">{h.t}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted">% achievement vs target by zone (demo).</p>
    </div>
  );
}

export function TrendChart({ data }: { data: Trend[] }) {
  const w = 560;
  const h = 180;
  const pad = 28;
  const maxY = 12_000;
  const maxX = Math.max(1, data.length - 1);
  const x = (i: number) => pad + (i / maxX) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / maxY) * (h - pad * 2);
  let pathT = "";
  let pathA = "";
  data.forEach((d, i) => {
    const xt = x(i);
    const yt = y(d.tgt);
    const ya = y(d.act);
    pathT += `${i ? " L " : "M "}${xt},${yt}`;
    pathA += `${i ? " L " : "M "}${xt},${ya}`;
  });
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[320px]">
        <path
          d={pathT}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
        <path d={pathA} fill="none" stroke="#00BAF2" strokeWidth={2.8} />
        {data.map((d, i) => (
          <g key={d.m}>
            <circle cx={x(i)} cy={y(d.act)} r={4} fill="#00BAF2" />
            <text
              x={x(i)}
              y={h - 6}
              textAnchor="middle"
              fill="#64748b"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {d.m}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-ink-muted">Solid: actual · Dashed: target (national SIM adds).</p>
    </div>
  );
}
