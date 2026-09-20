import { useEffect, useState } from "react";
import { clearEventSession, getEventSession, type EventSession } from "../utils/session";

export default function Dashboard() {
  const [eventSession, setEventSession] = useState<EventSession | null>(null);

  useEffect(() => {
    setEventSession(getEventSession());
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      {/* ================= HEADER DEL DASHBOARD ================= */}
      <main className="w-full px-6 py-6 lg:px-8">
        {/* Ambient glow */}
        <div className="relative">
          <div className="pointer-events-none absolute -top-10 left-1/4 h-32 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-6 right-1/4 h-28 w-80 rounded-full bg-teal-500/10 blur-3xl" />

          {/* Breadcrumb */}
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#464555]">
              <span className="cursor-pointer hover:text-indigo-600">
                Plataforma DISAGRO
              </span>

              <span>›</span>

              <span className="font-semibold text-[#131b2e]">
                Panel de Control General
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[#e2e7ff] px-3 py-1 text-xs shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#6bd8cb]" />

              <span className="font-semibold text-[#3525cd]">
                Feria Nacional Agro 2025
              </span>

              <span className="text-gray-400">•</span>

              <span className="text-gray-600">
                Turno Matutino (Sincronizado)
              </span>
            </div>
          </div>

          {/* ================= TITULO ================= */}
          <div className="relative mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-tight text-[#131b2e] lg:text-4xl">
                  Centro de Comando & Control Operativo
                </h1>

                <span className="rounded bg-[#85f8c4] px-2 py-0.5 text-xs font-semibold text-[#002114]">
                  LIVE
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-[#464555]">
                Monitoreo en tiempo real de ingresos de feria, afluencia de
                productores agrícolas, expedición de insumos y conciliación
                POS en Quetzales (Q).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium shadow-sm transition hover:bg-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  tune
                </span>

                Configurar Metas
              </button>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg bg-[#3525cd] px-4 text-sm font-medium text-white shadow-md transition hover:bg-[#4f46e5]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  picture_as_pdf
                </span>

                Descargar Reporte Ejecutivo
              </button>
            </div>
          </div>
        </div>

        {eventSession && (
          <div
            style={{
              border: "1px solid rgba(53, 37, 205, 0.15)",
              background: "linear-gradient(135deg, rgba(226,231,255,0.9), rgba(220,252,231,0.85))",
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 24,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: "#3525cd", textTransform: "uppercase" }}>
                Sesión activa
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: "#131b2e" }}>
                {eventSession.clientName}
              </div>
              <div style={{ fontSize: 13, color: "#464555" }}>
                {eventSession.servicesCount} servicios · {eventSession.productsCount} productos · Descuento {eventSession.discountPercentage}%
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ padding: "8px 12px", borderRadius: 12, background: "rgba(255,255,255,0.7)", fontWeight: 700, color: "#0f172a" }}>
                Total: Q{Number(eventSession.total).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => {
                  clearEventSession();
                  setEventSession(null);
                }}
                style={{
                  background: "rgba(15, 23, 42, 0.05)",
                  border: "1px solid rgba(15, 23, 42, 0.15)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#131b2e",
                }}
              >
                Limpiar sesión
              </button>
            </div>
          </div>
        )}

        {/* ================= KPI CARDS ================= */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Facturación */}
          <KpiCard
            icon="payments"
            iconColor="text-[#3525cd]"
            iconBg="bg-[#e2e7ff]"
            title="Total Facturación Evento"
            value="Q428,750.00"
            badge="Meta Superada"
            badgeColor="bg-[#85f8c4] text-[#002114]"
            footer="+18.4% vs meta diaria (Q350k)"
            percentage="122.5%"
            progress="100%"
            progressColor="bg-[#005338]"
          />

          {/* Productores */}
          <KpiCard
            icon="groups"
            iconColor="text-[#006a61]"
            iconBg="bg-[#86f2e4]/40"
            title="Productores Atendidos"
            value="642"
            suffix="asistentes"
            badge="78% Aforo"
            badgeColor="bg-[#e2e7ff] text-[#131b2e]"
            footer="Pico: 88 check-ins/hora"
            percentage="Capacidad Recinto"
            progress="78%"
            progressColor="bg-[#006a61]"
          />

          {/* Productos */}
          <KpiCard
            icon="inventory_2"
            iconColor="text-[#3525cd]"
            iconBg="bg-[#e2dfff]"
            title="Insumos Despachados"
            value="1,850"
            suffix="unidades"
            badge="Bodega Central"
            badgeColor="bg-[#f2f3ff] text-[#464555]"
            footer="Top: NPK 15-15-15 & DK-390"
            percentage=""
            progress="92%"
            progressColor="bg-[#3525cd]"
          />

          {/* Descuento */}
          <KpiCard
            icon="percent"
            iconColor="text-[#464555]"
            iconBg="bg-[#e2e7ff]"
            title="Descuento Promedio Aplicado"
            value="13.8%"
            suffix="-Q59.2k"
            badge="Convenio Agrícola"
            badgeColor="bg-[#e2dfff] text-[#3525cd]"
            footer="Bonificación servicios + insumos"
            percentage="318 aplicados"
            progress="68%"
            progressColor="bg-[#3525cd]"
          />
        </div>

        {/* ================= CONTENIDO PRINCIPAL ================= */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* ================= COLUMNA IZQUIERDA ================= */}
          <div className="flex flex-col gap-5 lg:col-span-8">
            {/* Gráfico */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3525cd]" />

                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold">
                      Flujo Horario de Ingresos & Facturación Quetzales
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-[#464555]">
                    Correlación en tiempo real de afluencia de productores
                    versus monto consolidado de ventas.
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-[#f2f3ff] p-1">
                  <button className="rounded bg-white px-3 py-1 text-xs font-semibold text-[#3525cd] shadow-sm">
                    Hoy
                  </button>

                  <button className="px-3 py-1 text-xs text-gray-500">
                    Ayer
                  </button>

                  <button className="hidden px-3 py-1 text-xs text-gray-500 md:block">
                    Promedio Histórico
                  </button>
                </div>
              </div>

              {/* Leyenda */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f2f3ff] px-4 py-3 text-xs">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-[#3525cd]" />
                    Facturación Bruta (Q)
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-[#6bd8cb]" />
                    Asistencias / Check-ins
                  </div>
                </div>

                <div className="flex items-center gap-1 font-semibold text-[#005338]">
                  <span className="material-symbols-outlined text-[16px]">
                    show_chart
                  </span>

                  Pico: 11:30 hrs — Q84,200 / 88 productores
                </div>
              </div>

              {/* Gráfico */}
              <div className="overflow-x-auto">
                <div className="min-w-[620px]">
                  <div className="relative h-56">
                    {/* Líneas */}
                    <div className="absolute inset-x-0 top-4 border-t border-dashed border-[#eaedff]" />
                    <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-[#eaedff]" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-[#eaedff]" />
                    <div className="absolute inset-x-0 bottom-3 border-t border-[#eaedff]" />

                    <div className="absolute bottom-3 left-0 right-0 flex h-44 items-end justify-around px-3">
                      {[
                        ["40%", "25%"],
                        ["65%", "45%"],
                        ["85%", "70%"],
                        ["100%", "88%"],
                        ["78%", "65%"],
                        ["55%", "40%"],
                        ["75%", "60%"],
                        ["92%", "75%"],
                        ["82%", "65%"],
                        ["35%", "22%"],
                      ].map(([sales, attendance], index) => (
                        <div
                          key={index}
                          className="flex h-full items-end gap-1"
                        >
                          <div
                            className={`w-3 rounded-t ${
                              index === 3
                                ? "bg-[#3525cd]"
                                : index === 9
                                  ? "bg-[#dae2fd]"
                                  : "bg-[#4f46e5]"
                            }`}
                            style={{ height: sales }}
                          />

                          <div
                            className={`w-3 rounded-t ${
                              index === 3
                                ? "bg-[#006a61]"
                                : index === 9
                                  ? "bg-[#e2e7ff]"
                                  : "bg-[#6bd8cb]"
                            }`}
                            style={{ height: attendance }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-10 text-center text-[11px] text-gray-500">
                    {[
                      "08:00",
                      "09:00",
                      "10:00",
                      "11:00 ★",
                      "12:00",
                      "13:00",
                      "14:00",
                      "15:00",
                      "16:00",
                      "17:00",
                    ].map((hour, index) => (
                      <span
                        key={hour}
                        className={
                          index === 3
                            ? "font-bold text-[#3525cd]"
                            : index === 8
                              ? "font-semibold text-[#131b2e]"
                              : ""
                        }
                      >
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= TERMINALES ================= */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2e7ff] text-[#3525cd]">
                    <span className="material-symbols-outlined text-[20px]">
                      point_of_sale
                    </span>
                  </div>

                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold">
                      Cajas & Terminales POS Activas
                    </h2>

                    <p className="text-xs text-gray-500">
                      Sincronización descentralizada y arqueo de caja inmediato
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#85f8c4] px-2.5 py-1 text-xs font-semibold text-[#002114]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#005338]" />
                  4 de 4 Operativas
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="bg-[#f2f3ff] text-xs text-gray-500">
                      <th className="rounded-l-lg px-3 py-3">
                        TERMINAL / UBICACIÓN
                      </th>

                      <th className="px-3 py-3">OPERADOR</th>

                      <th className="px-3 py-3 text-center">
                        TRANSACCIONES
                      </th>

                      <th className="px-3 py-3 text-right">
                        TOTAL COBRADO
                      </th>

                      <th className="rounded-r-lg px-3 py-3 text-center">
                        ESTADO
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eaedff] text-sm">
                    <PosRow
                      number="01"
                      name="Stand Principal DISAGRO"
                      location="Pabellón Agrícola Central"
                      operator="Mayra Estrada"
                      initials="ME"
                      transactions="194"
                      total="Q142,650.00"
                    />

                    <PosRow
                      number="02"
                      name="Venta Rápida Insumos"
                      location="Zona Express Agroquímicos"
                      operator="Luis Castro Morales"
                      initials="LC"
                      transactions="230"
                      total="Q168,900.00"
                    />

                    <PosRow
                      number="03"
                      name="Atención a Cooperativas"
                      location="Lounge Mayoristas B2B"
                      operator="Sofía Valenzuela"
                      initials="SV"
                      transactions="78"
                      total="Q89,400.00"
                      status="Sincronizado"
                    />

                    <PosRow
                      number="04"
                      name="POS Bodega Móvil"
                      location="Área de Carga & Despacho"
                      operator="Danilo Ramos"
                      initials="DR"
                      transactions="42"
                      total="Q27,800.00"
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA ================= */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            {/* Acciones rápidas */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd]">
                  bolt
                </span>

                <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold">
                  Acciones Rápidas
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <QuickAction
                  primary
                  icon="how_to_reg"
                  title="+ Nueva Asistencia Rápida"
                  description="Registrar y cobrar en 1 paso"
                />

                <QuickAction
                  icon="person_add"
                  title="+ Registrar Productor"
                  description="Alta de ficha y DPI"
                />

                <QuickAction
                  icon="swap_horiz"
                  title="Ajuste Inmediato de Stock"
                  description="Reasignar entre bodegas"
                />

                <QuickAction
                  icon="qr_code_scanner"
                  title="Escanear Credencial QR"
                  description="Validar gafete de productor"
                />
              </div>
            </div>

            {/* Alertas */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600">
                    notifications_active
                  </span>

                  <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold">
                    Alertas
                  </h2>
                </div>

                <span className="rounded-full bg-[#ffdad6] px-2 py-0.5 text-xs font-semibold text-[#93000a]">
                  3 pendientes
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Alert
                  type="error"
                  title="STOCK BAJO UMBRAL"
                  time="Hace 4 min"
                  description="Fungicida Max Forte bajo el umbral mínimo (9 Litros restantes en Stand Central)."
                  button="Reabastecer desde Bodega"
                />

                <Alert
                  type="primary"
                  title="APROBACIÓN DE CRÉDITO"
                  time="Hace 12 min"
                  description="Cooperativa Los Cuchumatanes solicita autorización para ampliación de cupo crédito por Q50,000.00."
                  button="Aprobar Cupo"
                />

                <Alert
                  type="success"
                  title="CONCILIACIÓN EXITOSA"
                  time="Hace 28 min"
                  description="Cierre de lote POS Terminal #02 conciliado con éxito (Q168,900.00 transmitidos a BANRURAL)."
                />
              </div>
            </div>

            {/* Operador */}
            <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#3525cd] text-white">
                  <span className="material-symbols-outlined">
                    person
                  </span>

                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#005338]" />
                </div>

                <div>
                  <span className="block text-sm font-semibold">
                    Carlos Mendizábal
                  </span>

                  <span className="text-xs text-gray-500">
                    Coordinador General de Operaciones
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e2e7ff] text-[#3525cd] transition hover:bg-[#3525cd] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  call
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   COMPONENTES AUXILIARES
============================================================ */

interface KpiCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string;
  suffix?: string;
  badge: string;
  badgeColor: string;
  footer: string;
  percentage: string;
  progress: string;
  progressColor: string;
}

function KpiCard({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  suffix,
  badge,
  badgeColor,
  footer,
  percentage,
  progress,
  progressColor,
}: KpiCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {icon}
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-['Plus_Jakarta_Sans'] text-[30px] font-bold tracking-tight">
            {value}
          </span>

          {suffix && (
            <span className="text-xs text-gray-500">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{footer}</span>

        {percentage && (
          <span className="ml-2 shrink-0 font-semibold text-[#3525cd]">
            {percentage}
          </span>
        )}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e2e7ff]">
        <div
          className={`h-full rounded-full ${progressColor}`}
          style={{ width: progress }}
        />
      </div>
    </div>
  );
}

interface PosRowProps {
  number: string;
  name: string;
  location: string;
  operator: string;
  initials: string;
  transactions: string;
  total: string;
  status?: string;
}

function PosRow({
  number,
  name,
  location,
  operator,
  initials,
  transactions,
  total,
  status = "En Línea",
}: PosRowProps) {
  return (
    <tr className="transition hover:bg-[#f2f3ff]/60">
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#e2e7ff] text-xs font-bold text-[#3525cd]">
            #{number}
          </span>

          <div>
            <span className="block text-sm font-semibold">
              {name}
            </span>

            <span className="text-xs text-gray-500">
              {location}
            </span>
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2e7ff] text-[10px] font-semibold text-[#3525cd]">
            {initials}
          </div>

          <span className="text-sm font-medium">
            {operator}
          </span>
        </div>
      </td>

      <td className="px-3 py-3 text-center font-semibold">
        {transactions}
      </td>

      <td className="px-3 py-3 text-right font-['Plus_Jakarta_Sans'] font-semibold">
        {total}
      </td>

      <td className="px-3 py-3 text-center">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            status === "En Línea"
              ? "bg-[#85f8c4] text-[#002114]"
              : "bg-[#e2dfff] text-[#3525cd]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />

          {status}
        </span>
      </td>
    </tr>
  );
}

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  primary?: boolean;
}

function QuickAction({
  icon,
  title,
  description,
  primary = false,
}: QuickActionProps) {
  return (
    <button
      type="button"
      className={`group flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
        primary
          ? "bg-[#3525cd] text-white shadow-sm hover:bg-[#4f46e5]"
          : "bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            primary
              ? "bg-white/15"
              : "bg-white text-[#3525cd] shadow-sm"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {icon}
          </span>
        </div>

        <div>
          <span className="block text-sm font-semibold">
            {title}
          </span>

          <span
            className={`text-xs ${
              primary ? "text-white/80" : "text-gray-500"
            }`}
          >
            {description}
          </span>
        </div>
      </div>

      <span className="material-symbols-outlined text-[18px] transition group-hover:translate-x-1">
        arrow_forward
      </span>
    </button>
  );
}

interface AlertProps {
  type: "error" | "primary" | "success";
  title: string;
  time: string;
  description: string;
  button?: string;
}

function Alert({
  type,
  title,
  time,
  description,
  button,
}: AlertProps) {
  const styles = {
    error: {
      container: "bg-[#ffdad6]/40",
      text: "text-[#ba1a1a]",
      icon: "warning",
    },
    primary: {
      container: "bg-[#e2e7ff]",
      text: "text-[#3525cd]",
      icon: "verified_user",
    },
    success: {
      container: "bg-[#85f8c4]/30",
      text: "text-[#005338]",
      icon: "check_circle",
    },
  };

  const style = styles[type];

  return (
    <div className={`rounded-lg p-3 ${style.container}`}>
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold ${style.text}`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {style.icon}
          </span>

          {title}
        </div>

        <span className="text-[11px] text-gray-500">
          {time}
        </span>
      </div>

      <p className="mt-2 text-xs font-medium leading-relaxed text-[#131b2e]">
        {description}
      </p>

      {button && (
        <button
          type="button"
          className={`mt-2 rounded px-2.5 py-1 text-[11px] font-semibold ${
            type === "error"
              ? "bg-white text-[#ba1a1a]"
              : "bg-[#3525cd] text-white"
          }`}
        >
          {button}
        </button>
      )}
    </div>
  );
}