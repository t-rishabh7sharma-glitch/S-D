import { Outlet } from "react-router-dom";
import { SyncStatusStrip } from "@/components/SyncStatusStrip";

/** Driver-style shell: dark canvas, full-height, safe-area friendly. */
export function FieldLayout() {
  return (
    <div className="min-h-dvh bg-[#0a0d12] text-white antialiased">
      <SyncStatusStrip surface="field" />
      <Outlet />
    </div>
  );
}
