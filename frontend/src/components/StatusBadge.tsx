import type { AttendanceStatus } from "../types";

const labels: Record<AttendanceStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}