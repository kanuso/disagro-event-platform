import { AttendanceStatus } from '@prisma/client';

export interface CreateAttendanceData {
  clientId: number;
  subtotal: number;
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesDiscountPct: number;
  productsDiscountPct: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  status?: AttendanceStatus;
  confirmedAt?: Date | null;
}

export interface AttendanceLineService {
  serviceId: number;
  quantity: number;
  price: number;
}

export interface AttendanceLineProduct {
  productId: number;
  quantity: number;
  price: number;
}

export interface FindAllAttendanceFilters {
  status?: AttendanceStatus;
  clientId?: number;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}