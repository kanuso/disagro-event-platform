import { useEffect, useMemo, useState } from "react";
import { attendanceService } from "../services/attendance.service";
import AttendanceFormModal from "../components/AttendanceFormModal";
import StatusBadge from "../components/StatusBadge";
import type { Attendance, AttendanceStatus } from "../types";

type Filter = "ALL" | AttendanceStatus;

export default function Attendances() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAll();
      setAttendances(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando asistencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (filter === "ALL" ? attendances : attendances.filter((a) => a.status === filter)),
    [attendances, filter]
  );

  const handleConfirm = async (id: number) => {
    try {
      setActionId(id);
      const updated = await attendanceService.confirm(id);
      setAttendances((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Error al confirmar");
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("¿Cancelar esta asistencia?")) return;
    try {
      setActionId(id);
      const updated = await attendanceService.cancel(id);
      setAttendances((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Error al cancelar");
    } finally {
      setActionId(null);
    }
  };

  const fmt = (v: number | string) => `Q${Number(v).toFixed(2)}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Asistencias</h1>
          <p>Gestión de asistencias a eventos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nueva asistencia
        </button>
      </div>

      <div className="filters">
        {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as Filter[]).map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "Todas" : f}
          </button>
        ))}
      </div>

      {loading && <p>Cargando asistencias...</p>}
      {error && <div className="alert-error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p>No hay asistencias {filter !== "ALL" ? `con estado ${filter}` : ""}.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Servicios</th>
                <th>Productos</th>
                <th className="right">Subtotal</th>
                <th className="right">Descuento</th>
                <th className="right">Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.client?.name ?? `Cliente #${a.clientId}`}</td>
<td>
  {a.services?.reduce((acc, s) => acc + s.quantity, 0) ?? 0}
</td>
<td>
  {a.products?.reduce((acc, p) => acc + p.quantity, 0) ?? 0}
</td>
                  <td className="right">{fmt(a.subtotal)}</td>
                  <td className="right">{fmt(a.discountAmount)}</td>
                  <td className="right strong">{fmt(a.total)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="center">
                    {a.status === "PENDING" && (
                      <>
                        <button
                          className="btn-small btn-success"
                          disabled={actionId === a.id}
                          onClick={() => handleConfirm(a.id)}
                        >
                          Confirmar
                        </button>
                        <button
                          className="btn-small btn-danger"
                          disabled={actionId === a.id}
                          onClick={() => handleCancel(a.id)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status !== "PENDING" && <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <AttendanceFormModal
          onClose={() => setModalOpen(false)}
          onCreated={(created) => setAttendances((prev) => [created, ...prev])}
        />
      )}
    </div>
  );
}