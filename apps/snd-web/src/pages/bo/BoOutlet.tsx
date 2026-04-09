import { Navigate, useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { canAccessBoRoute, type BoRoute } from "@/lib/rbac";
import { BoDashboard } from "@/pages/bo/views/Dashboard";
import { BoUsers } from "@/pages/bo/views/Users";
import { BoKpis } from "@/pages/bo/views/Kpis";
import { BoTargets } from "@/pages/bo/views/Targets";
import { BoRoles } from "@/pages/bo/views/Roles";
import { BoHierarchy } from "@/pages/bo/views/Hierarchy";
import { BoTerritory } from "@/pages/bo/views/Territory";
import { BoIncentives } from "@/pages/bo/views/Incentives";
import { BoReports } from "@/pages/bo/views/Reports";

const ALL: BoRoute[] = [
  "dashboard",
  "hierarchy",
  "users",
  "territory",
  "kpis",
  "targets",
  "incentives",
  "roles",
  "reports",
];

function isBoRoute(s: string | undefined): s is BoRoute {
  return !!s && (ALL as string[]).includes(s);
}

export function BoOutlet() {
  const { module } = useParams<{ module: string }>();
  const { session } = useSession();
  if (!session) return null;

  const seg = isBoRoute(module) ? module : "dashboard";
  if (!isBoRoute(module)) {
    return <Navigate to="/bo/dashboard" replace />;
  }

  if (!canAccessBoRoute(session.roleKey, seg)) {
    return (
      <Navigate
        to="/bo/dashboard"
        replace
        state={{ toast: "You don't have access to that module for your role." }}
      />
    );
  }

  switch (seg) {
    case "dashboard":
      return <BoDashboard />;
    case "users":
      return <BoUsers />;
    case "kpis":
      return <BoKpis />;
    case "targets":
      return <BoTargets />;
    case "roles":
      return <BoRoles />;
    case "hierarchy":
      return <BoHierarchy />;
    case "territory":
      return <BoTerritory />;
    case "incentives":
      return <BoIncentives />;
    case "reports":
      return <BoReports />;
    default:
      return <BoDashboard />;
  }
}
