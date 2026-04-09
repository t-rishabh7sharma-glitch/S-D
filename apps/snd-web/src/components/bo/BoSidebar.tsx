import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Coins,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Network,
  Shield,
  Target,
  Users,
} from "lucide-react";
import type { BoRoute } from "@/lib/rbac";

const items: { to: BoRoute; label: string; icon: typeof LayoutDashboard }[] = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "hierarchy", label: "Hierarchy", icon: Network },
  { to: "users", label: "Users & agents", icon: Users },
  { to: "territory", label: "Territory", icon: MapPinned },
  { to: "kpis", label: "KPI engine", icon: Gauge },
  { to: "targets", label: "Targets", icon: Target },
  { to: "incentives", label: "Incentives", icon: Coins },
  { to: "roles", label: "Roles & RBAC", icon: Shield },
  { to: "reports", label: "Analytics", icon: BarChart3 },
];

export function BoSidebar({
  allowed,
  onNavigate,
}: {
  allowed: Set<BoRoute>;
  onNavigate?: () => void;
}) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-navy via-navy to-[#001233] px-4 pb-6 pt-8 text-white">
      <div className="relative z-10 mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-navy-mid text-[10px] font-extrabold tracking-wider shadow-lg shadow-primary/40 ring-2 ring-white/10">
          SND
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight tracking-tight">
            Sales &amp; Distribution
          </div>
          <div className="text-[11px] font-medium text-white/55">Control plane</div>
        </div>
      </div>
      <nav
        id="bo-nav"
        className="relative z-10 flex flex-1 flex-col gap-1"
        aria-label="Primary"
      >
        {items.map(({ to, label, icon: Icon }) => {
          if (!allowed.has(to)) return null;
          return (
            <NavLink
              key={to}
              to={`/bo/${to}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-out ${
                  isActive
                    ? "bg-primary/20 text-primary shadow-[inset_3px_0_0_0] shadow-primary ring-1 ring-primary/20"
                    : "text-white/78 hover:bg-white/[0.08] hover:text-white active:scale-[0.99]"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
