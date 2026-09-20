import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  Download,
  CalendarDays,
  Layers3,
  Package,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

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
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    load();
  }, []);

  /*
   * Estadísticas reales
   */
  const stats = useMemo(() => {
    const all = attendances.length;

    const pending = attendances.filter(
      (attendance) => attendance.status === "PENDING"
    ).length;

    const confirmed = attendances.filter(
      (attendance) => attendance.status === "CONFIRMED"
    ).length;

    const cancelled = attendances.filter(
      (attendance) => attendance.status === "CANCELLED"
    ).length;

    const total = attendances.reduce(
      (acc, attendance) => acc + Number(attendance.total || 0),
      0
    );

    const services = attendances.reduce(
      (acc, attendance) =>
        acc +
        (attendance.services?.reduce(
          (sum, service) => sum + Number(service.quantity || 0),
          0
        ) ?? 0),
      0
    );

    const products = attendances.reduce(
      (acc, attendance) =>
        acc +
        (attendance.products?.reduce(
          (sum, product) => sum + Number(product.quantity || 0),
          0
        ) ?? 0),
      0
    );

    return {
      all,
      pending,
      confirmed,
      cancelled,
      total,
      services,
      products,
    };
  }, [attendances]);

  /*
   * Filtrado
   */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return attendances.filter((attendance) => {
      const matchesFilter =
        filter === "ALL" || attendance.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const clientName =
        attendance.client?.name ?? `Cliente #${attendance.clientId}`;

      return (
        clientName.toLowerCase().includes(term) ||
        String(attendance.id).includes(term) ||
        attendance.status.toLowerCase().includes(term)
      );
    });
  }, [attendances, filter, search]);

  /*
   * Confirmar
   */
  const handleConfirm = async (id: number) => {
    try {
      setActionId(id);

      const updated = await attendanceService.confirm(id);

      setAttendances((prev) =>
        prev.map((attendance) =>
          attendance.id === id ? updated : attendance
        )
      );
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          "Error al confirmar la asistencia"
      );
    } finally {
      setActionId(null);
    }
  };

  /*
   * Cancelar
   */
  const handleCancel = async (id: number) => {
    if (!confirm("¿Cancelar esta asistencia?")) {
      return;
    }

    try {
      setActionId(id);

      const updated = await attendanceService.cancel(id);

      setAttendances((prev) =>
        prev.map((attendance) =>
          attendance.id === id ? updated : attendance
        )
      );
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          "Error al cancelar la asistencia"
      );
    } finally {
      setActionId(null);
    }
  };

  /*
   * Formato monetario
   */
  const fmt = (value: number | string) =>
    `Q${Number(value || 0).toFixed(2)}`;

  /*
   * Formato de fecha
   */
  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Iniciales del cliente
   */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="page">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="page-header">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Plataforma DISAGRO</span>
            <span>/</span>
            <span>Módulo Operativo</span>
            <span>/</span>

            <strong style={{ color: "#334155" }}>
              Registro y Gestión de Asistencias
            </strong>
          </div>

          <h1>Gestión de Asistencias & Citas de Campo</h1>

          <p>
            Control en tiempo real de acreditaciones de productores,
            despachos vinculados de insumos/servicios y liquidación en
            Quetzales (Q).
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn"
            onClick={load}
            disabled={loading}
            title="Actualizar información"
          >
            <RotateCw
              size={17}
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : undefined,
              }}
            />

            {loading ? "Sincronizando..." : "Sincronizar"}
          </button>

          <button className="btn">
            <Download size={17} />
            Exportar reporte
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={18} />
            Nueva asistencia
          </button>
        </div>
      </div>

      {/* =========================================================
          KPI CARDS
      ========================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* TOTAL */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Total asistencias
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {stats.all}
              </div>
            </div>

            <div className="stat-icon stat-icon-blue">
              <Layers3 size={20} />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Registros cargados
          </div>
        </div>

        {/* PENDIENTES */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Pendientes
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {stats.pending}
              </div>
            </div>

            <div className="stat-icon stat-icon-orange">
              <Clock3 size={20} />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Requieren atención
          </div>
        </div>

        {/* CONFIRMADAS */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Confirmadas
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {stats.confirmed}
              </div>
            </div>

            <div className="stat-icon stat-icon-green">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Asistencias confirmadas
          </div>
        </div>

        {/* CANCELADAS */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Canceladas
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {stats.cancelled}
              </div>
            </div>

            <div className="stat-icon stat-icon-red">
              <XCircle size={20} />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Registros cancelados
          </div>
        </div>
      </div>

      {/* =========================================================
          RESUMEN OPERATIVO
      ========================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* SERVICIOS */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div className="stat-icon stat-icon-purple">
              <Wrench size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Servicios registrados
              </div>

              <strong
                style={{
                  fontSize: "20px",
                  color: "#0f172a",
                }}
              >
                {stats.services}
              </strong>
            </div>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div className="stat-icon stat-icon-blue">
              <Package size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Productos registrados
              </div>

              <strong
                style={{
                  fontSize: "20px",
                  color: "#0f172a",
                }}
              >
                {stats.products}
              </strong>
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div className="stat-icon stat-icon-green">
              <ShieldCheck size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Total registrado
              </div>

              <strong
                style={{
                  fontSize: "20px",
                  color: "#0f172a",
                }}
              >
                {fmt(stats.total)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTENEDOR PRINCIPAL
      ========================================================= */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* =======================================================
            TOOLBAR
        ======================================================= */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* FILTROS */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginRight: "4px",
                }}
              >
                <Filter size={15} />
                Estado
              </div>

              <button
                className={`filter-chip ${
                  filter === "ALL" ? "active" : ""
                }`}
                onClick={() => setFilter("ALL")}
              >
                Todas
                <span>{stats.all}</span>
              </button>

              <button
                className={`filter-chip ${
                  filter === "PENDING" ? "active" : ""
                }`}
                onClick={() => setFilter("PENDING")}
              >
                Pendientes
                <span>{stats.pending}</span>
              </button>

              <button
                className={`filter-chip ${
                  filter === "CONFIRMED" ? "active" : ""
                }`}
                onClick={() => setFilter("CONFIRMED")}
              >
                Confirmadas
                <span>{stats.confirmed}</span>
              </button>

              <button
                className={`filter-chip ${
                  filter === "CANCELLED" ? "active" : ""
                }`}
                onClick={() => setFilter("CANCELLED")}
              >
                Canceladas
                <span>{stats.cancelled}</span>
              </button>
            </div>

            {/* BUSCADOR */}
            <div
              style={{
                position: "relative",
                width: "360px",
                maxWidth: "100%",
              }}
            >
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />

              <input
                type="text"
                placeholder="Buscar cliente, ID o estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "10px 14px 10px 40px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  outline: "none",
                  fontSize: "13px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}
        {loading && (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <RotateCw
              size={28}
              style={{
                animation: "spin 1s linear infinite",
                marginBottom: "12px",
              }}
            />

            <div>Cargando asistencias...</div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================= */}
        {!loading && error && (
          <div style={{ padding: "20px 24px" }}>
            <div className="alert-error">{error}</div>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================= */}
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              padding: "80px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays
                size={26}
                color="#64748b"
              />
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                color: "#0f172a",
                fontSize: "17px",
              }}
            >
              No se encontraron asistencias
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {search
                ? "Prueba con otro término de búsqueda."
                : filter !== "ALL"
                ? `No existen registros con estado ${filter.toLowerCase()}.`
                : "Todavía no hay asistencias registradas."}
            </p>
          </div>
        )}

 {/* =======================================================
    TABLA
======================================================= */}
{!loading && !error && filtered.length > 0 && (
  <>
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th className="ps-4">Registro</th>
            <th>Cliente</th>
            <th>Detalle</th>
            <th>Liquidación</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th className="text-center pe-4">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((attendance) => {
            const clientName =
              attendance.client?.name ??
              `Cliente #${attendance.clientId}`;

            const services =
              attendance.services?.reduce(
                (acc, service) =>
                  acc + Number(service.quantity || 0),
                0
              ) ?? 0;

            const products =
              attendance.products?.reduce(
                (acc, product) =>
                  acc + Number(product.quantity || 0),
                0
              ) ?? 0;

            const processing = actionId === attendance.id;

            return (
              <tr key={attendance.id}>

                {/* REGISTRO */}
                <td className="ps-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="record-number">
                      #{attendance.id}
                    </div>

                    <div>
                      <div className="fw-semibold text-dark">
                        Asistencia
                      </div>

                      <small className="text-muted">
                        ID de registro
                      </small>
                    </div>
                  </div>
                </td>

                {/* CLIENTE */}
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="client-avatar">
                      {getInitials(clientName)}
                    </div>

                    <div className="min-w-0">
                      <div
                        className="fw-semibold text-dark text-truncate"
                        style={{ maxWidth: "220px" }}
                        title={clientName}
                      >
                        {clientName}
                      </div>

                      <small className="text-muted">
                        Cliente #{attendance.clientId}
                      </small>
                    </div>
                  </div>
                </td>

                {/* DETALLE */}
                <td>
                  <div className="d-flex align-items-center gap-3">

                    <div className="d-flex align-items-center gap-2">
                      <div className="detail-icon detail-service">
                        <Wrench size={15} />
                      </div>

                      <div>
                        <div className="fw-semibold">
                          {services}
                        </div>

                        <small className="text-muted">
                          Servicios
                        </small>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "1px",
                        height: "32px",
                        background: "#e2e8f0",
                      }}
                    />

                    <div className="d-flex align-items-center gap-2">
                      <div className="detail-icon detail-product">
                        <Package size={15} />
                      </div>

                      <div>
                        <div className="fw-semibold">
                          {products}
                        </div>

                        <small className="text-muted">
                          Productos
                        </small>
                      </div>
                    </div>

                  </div>
                </td>

                {/* LIQUIDACIÓN */}
                <td>
                  <div>
                    <div className="fw-bold text-dark">
                      {fmt(attendance.total)}
                    </div>

                    <div className="d-flex gap-3 mt-1">
                      <small className="text-muted">
                        Subtotal: {fmt(attendance.subtotal)}
                      </small>

                      <small className="text-danger">
                        Desc.: {fmt(attendance.discountAmount)}
                      </small>
                    </div>
                  </div>
                </td>

                {/* ESTADO */}
                <td>
                  <StatusBadge
                    status={
                      attendance.status as AttendanceStatus
                    }
                  />
                </td>

                {/* FECHA */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <CalendarDays
                      size={16}
                      className="text-muted"
                    />

                    <div>
                      <div className="fw-medium">
                        {formatDate(attendance.createdAt)}
                      </div>

                      <small className="text-muted">
                        Registro creado
                      </small>
                    </div>
                  </div>
                </td>

                {/* ACCIONES */}
                <td className="text-center pe-4">
                  {attendance.status === "PENDING" ? (
                    <div className="d-flex justify-content-center gap-2">

                      <button
                        type="button"
                        className="btn btn-sm btn-success d-flex align-items-center gap-1"
                        disabled={processing}
                        onClick={() =>
                          handleConfirm(attendance.id)
                        }
                      >
                        <CheckCircle2 size={15} />

                        {processing
                          ? "Procesando..."
                          : "Confirmar"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        disabled={processing}
                        onClick={() =>
                          handleCancel(attendance.id)
                        }
                      >
                        <XCircle size={15} />

                        Cancelar
                      </button>

                    </div>
                  ) : (
                    <span className="text-muted small">
                      Sin acciones
                    </span>
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* =====================================================
        FOOTER DE TABLA
    ===================================================== */}
    <div
      className="d-flex align-items-center justify-content-between flex-wrap gap-3"
      style={{
        padding: "16px 24px",
        borderTop: "1px solid #e2e8f0",
        background: "#fafbfc",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        Mostrando{" "}
        <strong style={{ color: "#334155" }}>
          {filtered.length}
        </strong>{" "}
        de{" "}
        <strong style={{ color: "#334155" }}>
          {attendances.length}
        </strong>{" "}
        registros
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{
            width: "34px",
            height: "34px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          1
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </>
)}
      </div>

      {/* =========================================================
          MODAL
      ========================================================= */}
      {modalOpen && (
        <AttendanceFormModal
          onClose={() => setModalOpen(false)}
          onCreated={(created) => {
            setAttendances((prev) => [created, ...prev]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}