import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sprout,
  User,
  Mail,
  Phone,
  Building,
  Wrench,
  Package,
  Percent,
  Minus,
  Plus,
} from "lucide-react";
import { serviceService } from "../services/service.service";
import { productService } from "../services/product.service";
import { attendanceService } from "../services/attendance.service";
import { calculateDiscount } from "../utils/discount";
import { saveEventSession } from "../utils/session";
import type { Service, Product } from "../types";

interface LineItem<T> {
  id: number;
  quantity: number;
  entity: T;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function PublicAttendanceForm() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedServices, setSelectedServices] = useState<LineItem<Service>[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<LineItem<Product>[]>([]);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- Cargar catálogo ----
  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          serviceService.getActive(),
          productService.getActive(),
        ]);
        setServices(s);
        setProducts(p);
      } catch {
        setError("Error al cargar el catálogo. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toNumber = (v: number | string) =>
    typeof v === "string" ? parseFloat(v) : v;

  // ---- Cálculo en vivo ----
  const discount = useMemo(() => {
    const servicesSubtotal = selectedServices.reduce(
      (acc, item) => acc + toNumber(item.entity.price) * item.quantity,
      0
    );
    const productsSubtotal = selectedProducts.reduce(
      (acc, item) => acc + toNumber(item.entity.price) * item.quantity,
      0
    );

    return calculateDiscount({
      servicesSubtotal,
      productsSubtotal,
      servicesCount: selectedServices.length,
      productsCount: selectedProducts.length,
    });
  }, [selectedServices, selectedProducts]);

  // ---- Toggle / cantidad ----
  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.find((x) => x.id === service.id)
        ? prev.filter((x) => x.id !== service.id)
        : [...prev, { id: service.id, quantity: 1, entity: service }]
    );
  };

  const toggleProduct = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.find((x) => x.id === product.id)
        ? prev.filter((x) => x.id !== product.id)
        : [...prev, { id: product.id, quantity: 1, entity: product }]
    );
  };

  const changeQty = <T,>(
    setter: React.Dispatch<React.SetStateAction<LineItem<T>[]>>,
    id: number,
    delta: number
  ) => {
    setter((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, quantity: Math.max(1, x.quantity + delta) } : x
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm({ name: "", email: "", phone: "", company: "" });
    setSelectedServices([]);
    setSelectedProducts([]);
    setSubmitted(false);
    setCreatedId(null);
    setError(null);
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      return setError("Ingresa tu nombre completo");
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return setError("Ingresa un email válido");
    }
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      return setError("Selecciona al menos un servicio o producto");
    }

    try {
      setSaving(true);
      const created = await attendanceService.createPublic({
        client: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
        },
        services: selectedServices.map((s) => ({
          serviceId: s.id,
          quantity: s.quantity,
        })),
        products: selectedProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
        })),
      });

      saveEventSession({
        clientId: created.clientId,
        clientName: form.name.trim(),
        email: form.email.trim(),
        subtotal: Number(created.subtotal),
        discountPercentage: Number(created.discountPercentage),
        discountAmount: Number(created.discountAmount),
        total: Number(created.total),
        servicesCount: selectedServices.length,
        productsCount: selectedProducts.length,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      setCreatedId(created.id);
      setSubmitted(true);

      setTimeout(() => {
        navigate(`/evento/confirmacion/${created.id}`);
      }, 2500);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Error al confirmar tu asistencia"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between"
      style={{
        backgroundColor: "#f4fbf7",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Fondo de puntos */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: "radial-gradient(#059669 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* HEADER */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f6848] text-white flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              DISAGRO<span className="text-[#0f6848]">.</span>
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              | PORTAL EVENTOS
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Convocatoria Abierta 2025
        </div>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 w-full">
        {submitted && createdId ? (
          /* ============ ESTADO DE ÉXITO ============ */
          <div
            className="w-full max-w-[480px] bg-white rounded-3xl p-8 sm:p-10 text-center space-y-5 mx-auto"
            style={{
              boxShadow:
                "0 20px 40px -15px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(5, 150, 105, 0.1)",
            }}
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                ¡Asistencia Confirmada!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Gracias,{" "}
                <strong className="text-slate-900">{form.name}</strong>. Hemos
                reservado tu cupo oficial.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Enviamos la confirmación a{" "}
                <span className="text-emerald-700 font-semibold">
                  {form.email}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Redirigiendo a tu portafolio personalizado...
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/evento/confirmacion/${createdId}`)}
              className="w-full py-3.5 px-6 bg-[#0f6848] hover:bg-[#0a4a33] text-white rounded-full font-bold text-sm shadow-md transition inline-flex items-center justify-center gap-2"
            >
              Ver mi portafolio ahora
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 transition"
            >
              Registrar otra persona
            </button>
          </div>
        ) : loading ? (
          /* ============ ESTADO DE CARGA ============ */
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm text-slate-500">Cargando catálogo...</p>
          </div>
        ) : (
          /* ============ FORMULARIO ============ */
          <div className="w-full max-w-[600px] flex flex-col items-center mx-auto">
            {/* Encabezado */}
            <div className="text-center mb-6 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/70 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Feria Nacional Agro 2025
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Confirma tu Asistencia
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Selecciona los servicios y productos de tu interés para armar
                tu portafolio personalizado con descuentos exclusivos.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="w-full mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* CARD PRINCIPAL */}
            <div
              className="w-full bg-white rounded-[28px] p-6 sm:p-9 relative overflow-hidden"
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(15, 104, 72, 0.12), 0 0 0 1px rgba(15, 104, 72, 0.08)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-1.5 bg-[#0f6848] rounded-b-full" />

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ============ DATOS DEL CLIENTE ============ */}
                <div className="space-y-4 text-left">
                  <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0f6848]" />
                    Tus datos
                  </h2>

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-bold text-slate-800">
                        Nombre completo:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Requerido
                      </span>
                    </div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Introduzca su nombre"
                        className="w-full h-12 pl-11 pr-5 rounded-full border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6848] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-bold text-slate-800">
                        Email:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Para confirmación
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Introduzca su Email"
                        className="w-full h-12 pl-11 pr-5 rounded-full border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6848] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-bold text-slate-800">
                        Teléfono:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Opcional
                      </span>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="5555-1234"
                        className="w-full h-12 pl-11 pr-5 rounded-full border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6848] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Finca, Agrícola o Empresa{" "}
                      <span className="text-slate-400 font-normal lowercase">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Ej. Finca Santa Lucía"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6848] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* ============ SERVICIOS ============ */}
                <div className="pt-4 border-t border-slate-200 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#0f6848]" />
                      Servicios de tu interés
                    </h2>
                    {selectedServices.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedServices.length} seleccionados
                      </span>
                    )}
                  </div>

                  {services.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">
                      No hay servicios disponibles.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {services.map((service) => {
                        const selected = selectedServices.find(
                          (x) => x.id === service.id
                        );
                        return (
                          <div
                            key={service.id}
                            className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                              selected
                                ? "border-[#0f6848] bg-emerald-50/50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <label className="flex flex-1 cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() => toggleService(service)}
                                className="h-4 w-4 accent-[#0f6848]"
                              />
                              <div>
                                <span className="block text-sm font-semibold text-slate-800">
                                  {service.name}
                                </span>
                                {service.description && (
                                  <span className="text-xs text-slate-500">
                                    {service.description}
                                  </span>
                                )}
                              </div>
                            </label>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-[#0f6848]">
                                Q{toNumber(service.price).toFixed(2)}
                              </span>

                              {selected && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeQty(
                                        setSelectedServices,
                                        service.id,
                                        -1
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-slate-700">
                                    {selected.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeQty(
                                        setSelectedServices,
                                        service.id,
                                        1
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ============ PRODUCTOS ============ */}
                <div className="pt-4 border-t border-slate-200 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#0f6848]" />
                      Productos de tu interés
                    </h2>
                    {selectedProducts.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedProducts.length} seleccionados
                      </span>
                    )}
                  </div>

                  {products.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">
                      No hay productos disponibles.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => {
                        const selected = selectedProducts.find(
                          (x) => x.id === product.id
                        );
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                              selected
                                ? "border-[#0f6848] bg-emerald-50/50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <label className="flex flex-1 cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() => toggleProduct(product)}
                                className="h-4 w-4 accent-[#0f6848]"
                              />
                              <div>
                                <span className="block text-sm font-semibold text-slate-800">
                                  {product.name}
                                </span>
                                {product.description && (
                                  <span className="text-xs text-slate-500">
                                    {product.description}
                                  </span>
                                )}
                              </div>
                            </label>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-[#0f6848]">
                                Q{toNumber(product.price).toFixed(2)}
                              </span>

                              {selected && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeQty(
                                        setSelectedProducts,
                                        product.id,
                                        -1
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-slate-700">
                                    {selected.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeQty(
                                        setSelectedProducts,
                                        product.id,
                                        1
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ============ RESUMEN ============ */}
                {(selectedServices.length > 0 ||
                  selectedProducts.length > 0) && (
                  <div className="pt-4 border-t border-slate-200">
                    <div
                      className="rounded-3xl p-6 text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #0f6848 0%, #0a4a33 100%)",
                        boxShadow:
                          "0 15px 30px -10px rgba(15, 104, 72, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Percent className="w-4 h-4" />
                        <h2 className="text-xs font-bold uppercase tracking-wider">
                          Resumen de tu portafolio
                        </h2>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between opacity-90">
                          <span>Subtotal servicios</span>
                          <span>
                            Q{discount.servicesSubtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between opacity-90">
                          <span>Subtotal productos</span>
                          <span>
                            Q{discount.productsSubtotal.toFixed(2)}
                          </span>
                        </div>

                        {discount.servicesDiscountPct > 0 && (
                          <div className="flex justify-between text-emerald-200">
                            <span>
                              🎉 Descuento servicios (
                              {discount.servicesDiscountPct}%)
                            </span>
                            <span>
                              −Q
                              {(
                                (discount.servicesSubtotal *
                                  discount.servicesDiscountPct) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {discount.productsDiscountPct > 0 && (
                          <div className="flex justify-between text-emerald-200">
                            <span>
                              🎉 Descuento productos (
                              {discount.productsDiscountPct}%)
                            </span>
                            <span>
                              −Q
                              {(
                                (discount.productsSubtotal *
                                  discount.productsDiscountPct) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-base">
                          <span className="font-semibold">Subtotal</span>
                          <span className="font-semibold">
                            Q{discount.subtotal.toFixed(2)}
                          </span>
                        </div>

                        {discount.discountPercentage > 0 && (
                          <div className="flex justify-between text-emerald-200">
                            <span>
                              Descuento total ({discount.discountPercentage}%)
                            </span>
                            <span>
                              −Q{discount.discountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-2xl font-bold">
                          <span>Total</span>
                          <span>Q{discount.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ BOTONES ============ */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#0f6848] hover:bg-[#0a4a33] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        Confirmar Registro
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Aviso */}
                <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Sus datos son protegidos bajo las políticas corporativas
                    de DISAGRO.
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-400 border-t border-emerald-950/5">
        © 2025 DISAGRO de Guatemala S.A. Todos los derechos reservados.
      </footer>
    </div>
  );
}