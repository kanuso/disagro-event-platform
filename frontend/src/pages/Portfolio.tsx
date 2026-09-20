import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { attendanceService } from "../services/attendance.service";
import StatusBadge from "../components/StatusBadge";
import type { Portfolio as PortfolioType } from "../types";

export default function Portfolio() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await attendanceService.getPortfolio(Number(id));
        setPortfolio(data);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ?? "No se encontró tu portafolio"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff]">
        <p className="text-[#464555]">Cargando tu portafolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <span className="text-5xl">😕</span>
          <h1 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#131b2e]">
            No encontramos tu portafolio
          </h1>
          <p className="mt-2 text-sm text-[#777587]">
            {error ?? "Verifica el enlace o confirma tu asistencia de nuevo."}
          </p>
          <Link
            to="/evento"
            className="mt-6 inline-block rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4f46e5]"
          >
            Volver al formulario
          </Link>
        </div>
      </div>
    );
  }

  const { summary } = portfolio;

  return (
    <div className="min-h-screen bg-[#faf8ff] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#85f8c4] px-3 py-1 text-xs font-semibold text-[#002114]">
            ✓ ASISTENCIA CONFIRMADA
          </span>
          <h1 className="mt-3 font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#131b2e] lg:text-4xl">
            ¡Gracias, {portfolio.client.name}!
          </h1>
          <p className="mt-2 text-sm text-[#464555]">
            Este es tu portafolio personalizado para el evento del{" "}
            <strong>{portfolio.eventDate}</strong>.
          </p>
        </div>

        {/* Info del cliente */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#131b2e]">
                Datos de contacto
              </h2>
              <p className="mt-1 text-sm text-[#464555]">
                {portfolio.client.email}
              </p>
              {portfolio.client.phone && (
                <p className="text-sm text-[#464555]">
                  {portfolio.client.phone}
                </p>
              )}
              {portfolio.client.company && (
                <p className="text-sm text-[#464555]">
                  {portfolio.client.company}
                </p>
              )}
            </div>
            <StatusBadge status={portfolio.status} />
          </div>
        </section>

        {/* Servicios */}
        {portfolio.services.length > 0 && (
          <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#131b2e]">
              🔧 Servicios seleccionados
            </h2>
            <div className="space-y-2">
              {portfolio.services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-[#f0f0f5] pb-2 last:border-0"
                >
                  <div>
                    <span className="block text-sm font-medium text-[#131b2e]">
                      {s.name}
                    </span>
                    {s.description && (
                      <span className="text-xs text-[#777587]">
                        {s.description}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-[#777587]">
                      {s.quantity} × Q{s.unitPrice.toFixed(2)}
                    </span>
                    <span className="block text-sm font-semibold text-[#3525cd]">
                      Q{s.lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Productos */}
        {portfolio.products.length > 0 && (
          <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#131b2e]">
              📦 Productos seleccionados
            </h2>
            <div className="space-y-2">
              {portfolio.products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-[#f0f0f5] pb-2 last:border-0"
                >
                  <div>
                    <span className="block text-sm font-medium text-[#131b2e]">
                      {p.name}
                    </span>
                    {p.description && (
                      <span className="text-xs text-[#777587]">
                        {p.description}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-[#777587]">
                      {p.quantity} × Q{p.unitPrice.toFixed(2)}
                    </span>
                    <span className="block text-sm font-semibold text-[#006a61]">
                      Q{p.lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resumen */}
        <section className="rounded-xl bg-gradient-to-br from-[#3525cd] to-[#4f46e5] p-6 text-white shadow-md">
          <h2 className="mb-4 font-['Plus_Jakarta_Sans'] text-base font-semibold">
            💰 Resumen de tu portafolio
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-80">Subtotal servicios</span>
              <span>Q{summary.servicesSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Subtotal productos</span>
              <span>Q{summary.productsSubtotal.toFixed(2)}</span>
            </div>

            {summary.servicesDiscountPct > 0 && (
              <div className="flex justify-between text-[#85f8c4]">
                <span>Descuento servicios ({summary.servicesDiscountPct}%)</span>
                <span>
                  −Q
                  {(
                    (summary.servicesSubtotal * summary.servicesDiscountPct) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            )}

            {summary.productsDiscountPct > 0 && (
              <div className="flex justify-between text-[#85f8c4]">
                <span>Descuento productos ({summary.productsDiscountPct}%)</span>
                <span>
                  −Q
                  {(
                    (summary.productsSubtotal * summary.productsDiscountPct) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            )}

            <div className="mt-3 flex justify-between border-t border-white/20 pt-3">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold">
                Q{summary.subtotal.toFixed(2)}
              </span>
            </div>

            {summary.discountPercentage > 0 && (
              <div className="flex justify-between text-[#85f8c4]">
                <span>Descuento total ({summary.discountPercentage}%)</span>
                <span>−Q{summary.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-2xl font-bold">
              <span>Total a pagar</span>
              <span>Q{summary.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#3525cd] shadow-sm hover:bg-[#f2f3ff]"
          >
            🖨️ Imprimir portafolio
          </button>
          <Link
            to="/evento"
            className="rounded-lg border border-[#d1d5db] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#131b2e] hover:bg-[#f9fafb]"
          >
            Confirmar otra asistencia
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-[#777587]">
          Si tienes dudas, contacta a tu asesor DISAGRO.
        </p>
      </div>
    </div>
  );
}