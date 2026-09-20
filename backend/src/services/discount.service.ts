interface DiscountInput {
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesCount: number;   // cantidad total de unidades de servicio
  productsCount: number;   // cantidad total de unidades de producto
}

interface DiscountResult {
  subtotal: number;
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesDiscountPct: number;
  productsDiscountPct: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
}

class DiscountService {
  calculate(input: DiscountInput): DiscountResult {
    const {
      servicesSubtotal,
      productsSubtotal,
      servicesCount,
      productsCount,
    } = input;

    const subtotal = servicesSubtotal + productsSubtotal;

    // ---- Reglas de SERVICIOS ----
    // 2+ servicios y suma > 1500  → 5%
    // 2+ servicios                → 3%
    let servicesDiscountPct = 0;
    if (servicesCount >= 2) {
      servicesDiscountPct = servicesSubtotal > 1500 ? 5 : 3;
    }

    // ---- Reglas de PRODUCTOS ----
    // 5+ productos → 5%
    // 3+ productos → 3%
    let productsDiscountPct = 0;
    if (productsCount >= 5) {
      productsDiscountPct = 5;
    } else if (productsCount >= 3) {
      productsDiscountPct = 3;
    }

    // ---- Descuento total ----
    // Se SUMAN los porcentajes (servicios + productos)
    const discountPercentage =
      servicesDiscountPct + productsDiscountPct;

    const discountAmount = (subtotal * discountPercentage) / 100;
    const total = subtotal - discountAmount;

    return {
      subtotal: this.round(subtotal),
      servicesSubtotal: this.round(servicesSubtotal),
      productsSubtotal: this.round(productsSubtotal),
      servicesDiscountPct,
      productsDiscountPct,
      discountPercentage,
      discountAmount: this.round(discountAmount),
      total: this.round(total),
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

export default new DiscountService();