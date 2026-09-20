import { useEffect, useMemo, useState } from "react";
import { clientService } from "../services/client.service";
import { serviceService } from "../services/service.service";
import { productService } from "../services/product.service";
import { attendanceService } from "../services/attendance.service";
import { calculateDiscount } from "../utils/discount";
import { saveEventSession } from "../utils/session";
import type {
  Client,
  Service,
  Product,
  Attendance,
  CreateAttendanceRequest,
} from "../types";
import { Package, Wrench } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: (a: Attendance) => void;
}

interface LineItem<T> {
  id: number;
  quantity: number;
  entity: T;
}

export default function AttendanceFormModal({ onClose, onCreated }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState<number | "">("");
  const [selectedServices, setSelectedServices] = useState<LineItem<Service>[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<LineItem<Product>[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, s, p] = await Promise.all([
          clientService.getAll(),
          serviceService.getActive(),
          productService.getActive(),
        ]);
        setClients(c);
        setServices(s);
        setProducts(p);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toNumber = (v: number | string) =>
    typeof v === "string" ? parseFloat(v) : v;

  // ---- Cálculo del descuento en vivo ----
  const discount = useMemo(() => {
    const servicesSubtotal = selectedServices.reduce(
      (acc, item) => acc + toNumber(item.entity.price) * item.quantity,
      0
    );
    const productsSubtotal = selectedProducts.reduce(
      (acc, item) => acc + toNumber(item.entity.price) * item.quantity,
      0
    );
    const servicesCount = selectedServices.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const productsCount = selectedProducts.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    return calculateDiscount({
      servicesSubtotal,
      productsSubtotal,
      servicesCount,
      productsCount,
    });
  }, [selectedServices, selectedProducts]);

  const addService = (id: number) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setSelectedServices((prev) =>
      prev.find((x) => x.id === id)
        ? prev.map((x) => (x.id === id ? { ...x, quantity: x.quantity + 1 } : x))
        : [...prev, { id, quantity: 1, entity: s }]
    );
  };

  const addProduct = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setSelectedProducts((prev) =>
      prev.find((x) => x.id === id)
        ? prev.map((x) => (x.id === id ? { ...x, quantity: x.quantity + 1 } : x))
        : [...prev, { id, quantity: 1, entity: p }]
    );
  };

  const changeQty = <T,>(
    setter: React.Dispatch<React.SetStateAction<LineItem<T>[]>>,
    id: number,
    qty: number
  ) => {
    if (qty <= 0) {
      setter((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    setter((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: qty } : x)));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!clientId) {
      setError("Selecciona un cliente");
      return;
    }
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      setError("Agrega al menos un servicio o producto");
      return;
    }

    const payload: CreateAttendanceRequest = {
      clientId: Number(clientId),
      services: selectedServices.map((s) => ({
        serviceId: s.id,
        quantity: s.quantity,
      })),
      products: selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
      })),
    };

    try {
      setSaving(true);
      const created = await attendanceService.create(payload);
      const selectedClient = clients.find((c) => c.id === Number(clientId));
      const servicesCount = selectedServices.reduce((acc, item) => acc + item.quantity, 0);
      const productsCount = selectedProducts.reduce((acc, item) => acc + item.quantity, 0);

      saveEventSession({
        clientId: Number(clientId),
        clientName: selectedClient?.name ?? "Cliente",
        email: selectedClient?.email,
        subtotal: Number(created.subtotal ?? 0),
        discountPercentage: Number(created.discountPercentage ?? 0),
        discountAmount: Number(created.discountAmount ?? 0),
        total: Number(created.total ?? 0),
        servicesCount,
        productsCount,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });

      onCreated(created);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

   if (loading) {
    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-body text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              >
                <span className="visually-hidden">Cargando...</span>
              </div>

              <div className="fw-semibold text-dark">
                Cargando datos...
              </div>

              <div className="text-muted small mt-1">
                Preparando formulario de asistencia
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendanceModalTitle"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">

            {/* HEADER */}
            <div className="modal-header px-4 py-3">
              <div>
                <h5
                  className="modal-title fw-bold mb-1"
                  id="attendanceModalTitle"
                >
                  Nueva asistencia
                </h5>

                <div className="text-muted small">
                  Registra el cliente, servicios y productos asociados.
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
                disabled={saving}
              />
            </div>

            {/* BODY */}
            <div className="modal-body p-4">

              {error && (
                <div
                  className="alert alert-danger d-flex align-items-center gap-2"
                  role="alert"
                >
                  <span>{error}</span>
                </div>
              )}

              {/* CLIENTE */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Cliente
                </label>

                <select
                  className="form-select"
                  value={clientId}
                  onChange={(e) =>
                    setClientId(
                      e.target.value
                        ? Number(e.target.value)
                        : ""
                    )
                  }
                >
                  <option value="">
                    Seleccione un cliente...
                  </option>

                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company
                        ? ` — ${c.company}`
                        : ""}
                    </option>
                  ))}
                </select>

                <div className="form-text">
                  Selecciona el productor o cliente que realizará la asistencia.
                </div>
              </div>

              {/* SELECTORES */}
              <div className="row g-3 mb-4">

                {/* SERVICIOS */}
                <div className="col-md-6">
                  <div className="card border h-100 shadow-none">
                    <div className="card-body">

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="detail-icon detail-service">
                          <Wrench size={16} />
                        </div>

                        <div>
                          <div className="fw-semibold">
                            Servicios
                          </div>

                          <small className="text-muted">
                            Agrega servicios activos
                          </small>
                        </div>
                      </div>

                      <select
                        className="form-select"
                        onChange={(e) => {
                          if (e.target.value) {
                            addService(Number(e.target.value));
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">
                          + Agregar servicio...
                        </option>

                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — Q
                            {toNumber(s.price).toFixed(2)}
                          </option>
                        ))}
                      </select>

                    </div>
                  </div>
                </div>

                {/* PRODUCTOS */}
                <div className="col-md-6">
                  <div className="card border h-100 shadow-none">
                    <div className="card-body">

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="detail-icon detail-product">
                          <Package size={16} />
                        </div>

                        <div>
                          <div className="fw-semibold">
                            Productos
                          </div>

                          <small className="text-muted">
                            Agrega productos activos
                          </small>
                        </div>
                      </div>

                      <select
                        className="form-select"
                        onChange={(e) => {
                          if (e.target.value) {
                            addProduct(Number(e.target.value));
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">
                          + Agregar producto...
                        </option>

                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — Q
                            {toNumber(p.price).toFixed(2)}
                          </option>
                        ))}
                      </select>

                    </div>
                  </div>
                </div>

              </div>

              {/* ITEMS */}
              {(selectedServices.length > 0 ||
                selectedProducts.length > 0) && (
                <div className="card border shadow-none mb-4">

                  <div className="card-header bg-white py-3">
                    <div className="fw-semibold">
                      Detalle de la asistencia
                    </div>

                    <small className="text-muted">
                      Ajusta las cantidades de los servicios y productos.
                    </small>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">

                      <thead className="table-light">
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th style={{ width: "120px" }}>
                            Cantidad
                          </th>
                          <th className="text-end">
                            P. Unit.
                          </th>
                          <th className="text-end">
                            Importe
                          </th>
                          <th style={{ width: "60px" }} />
                        </tr>
                      </thead>

                      <tbody>

                        {selectedServices.map((item) => (
                          <tr key={`s-${item.id}`}>

                            <td>
                              <span className="badge text-bg-primary">
                                Servicio
                              </span>
                            </td>

                            <td className="fw-medium">
                              {item.entity.name}
                            </td>

                            <td>
                              <input
                                type="number"
                                min={1}
                                className="form-control form-control-sm"
                                value={item.quantity}
                                onChange={(e) =>
                                  changeQty(
                                    setSelectedServices,
                                    item.id,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>

                            <td className="text-end">
                              Q
                              {toNumber(
                                item.entity.price
                              ).toFixed(2)}
                            </td>

                            <td className="text-end fw-semibold">
                              Q
                              {(
                                toNumber(item.entity.price) *
                                item.quantity
                              ).toFixed(2)}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  changeQty(
                                    setSelectedServices,
                                    item.id,
                                    0
                                  )
                                }
                                title="Eliminar"
                              >
                                ×
                              </button>
                            </td>

                          </tr>
                        ))}

                        {selectedProducts.map((item) => (
                          <tr key={`p-${item.id}`}>

                            <td>
                              <span className="badge text-bg-info">
                                Producto
                              </span>
                            </td>

                            <td className="fw-medium">
                              {item.entity.name}
                            </td>

                            <td>
                              <input
                                type="number"
                                min={1}
                                className="form-control form-control-sm"
                                value={item.quantity}
                                onChange={(e) =>
                                  changeQty(
                                    setSelectedProducts,
                                    item.id,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>

                            <td className="text-end">
                              Q
                              {toNumber(
                                item.entity.price
                              ).toFixed(2)}
                            </td>

                            <td className="text-end fw-semibold">
                              Q
                              {(
                                toNumber(item.entity.price) *
                                item.quantity
                              ).toFixed(2)}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  changeQty(
                                    setSelectedProducts,
                                    item.id,
                                    0
                                  )
                                }
                                title="Eliminar"
                              >
                                ×
                              </button>
                            </td>

                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TOTALES */}
              <div className="row justify-content-end">
                <div className="col-lg-6 col-xl-5">

                  <div className="card border shadow-none">

                    <div className="card-body">

                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">
                          Subtotal servicios
                        </span>

                        <span>
                          Q{discount.servicesSubtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">
                          Subtotal productos
                        </span>

                        <span>
                          Q{discount.productsSubtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold">
                          Subtotal
                        </span>

                        <span className="fw-semibold">
                          Q{discount.subtotal.toFixed(2)}
                        </span>
                      </div>

                      {(discount.servicesDiscountPct > 0 ||
                        discount.productsDiscountPct > 0) && (
                        <>
                          <hr />

                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>
                              Descuento servicios (
                              {discount.servicesDiscountPct}%)
                            </span>

                            <span>
                              - Q
                              {(
                                (discount.servicesSubtotal *
                                  discount.servicesDiscountPct) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>
                              Descuento productos (
                              {discount.productsDiscountPct}%)
                            </span>

                            <span>
                              - Q
                              {(
                                (discount.productsSubtotal *
                                  discount.productsDiscountPct) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="d-flex justify-content-between mb-3 text-danger">
                        <span>
                          Descuento total (
                          {discount.discountPercentage}%)
                        </span>

                        <span>
                          - Q
                          {discount.discountAmount.toFixed(2)}
                        </span>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fs-5 fw-bold">
                          Total
                        </span>

                        <span className="fs-4 fw-bold text-primary">
                          Q{discount.total.toFixed(2)}
                        </span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="modal-footer px-4 py-3">

              <button
                type="button"
                className="btn btn-light border"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />

                    Guardando...
                  </>
                ) : (
                  "Guardar asistencia"
                )}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* BACKDROP REAL DE BOOTSTRAP */}
      <div
        className="modal-backdrop fade show"
        onClick={saving ? undefined : onClose}
      />
    </>
  );
}