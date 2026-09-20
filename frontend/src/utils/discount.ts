export interface DiscountInput {
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesCount: number;   // ← servicios DISTINTOS
  productsCount: number;   // ← productos DISTINTOS
}

export interface DiscountResult {
  subtotal: number;
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesDiscountPct: number;
  productsDiscountPct: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const {
    servicesSubtotal,
    productsSubtotal,
    servicesCount,
    productsCount,
  } = input;

  const subtotal = servicesSubtotal + productsSubtotal;

  // ---- Servicios ----
  let servicesDiscountPct = 0;
  if (servicesCount >= 2) {
    servicesDiscountPct = servicesSubtotal > 1500 ? 5 : 3;
  }

  // ---- Productos ----
  let productsDiscountPct = 0;
  if (productsCount >= 5) {
    productsDiscountPct = 5;
  } else if (productsCount >= 3) {
    productsDiscountPct = 3;
  }

  // ---- Descuento total (SUMA de porcentajes) ----
  const discountPercentage = servicesDiscountPct + productsDiscountPct;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const total = subtotal - discountAmount;

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    subtotal: round(subtotal),
    servicesSubtotal: round(servicesSubtotal),
    productsSubtotal: round(productsSubtotal),
    servicesDiscountPct,
    productsDiscountPct,
    discountPercentage,
    discountAmount: round(discountAmount),
    total: round(total),
  };
}