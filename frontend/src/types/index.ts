export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export interface AttendanceService {
  serviceId: number;
  quantity: number;
  price: number | string;
  service?: Service;
}

export interface AttendanceProduct {
  productId: number;
  quantity: number;
  price: number | string;
  product?: Product;
}

export interface Attendance {
  id: number;
  clientId: number;
  subtotal: number | string;
  discountPercentage: number | string;
  discountAmount: number | string;
  total: number | string;
  status: AttendanceStatus;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  client?: Client;
  services?: AttendanceService[];
  products?: AttendanceProduct[];
}

export interface CreateAttendanceService {
  serviceId: number;
  quantity: number;
}

export interface CreateAttendanceProduct {
  productId: number;
  quantity: number;
}

export interface CreateAttendanceRequest {
  clientId: number;
  services: CreateAttendanceService[];
  products: CreateAttendanceProduct[];
}

// ============================================================
// FLUJO PÚBLICO
// ============================================================

export interface CreatePublicAttendanceClient {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface CreatePublicAttendanceRequest {
  client: CreatePublicAttendanceClient;
  services: CreateAttendanceService[];
  products: CreateAttendanceProduct[];
}

export interface PortfolioLine {
  id: number;
  name: string;
  description?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Portfolio {
  id: number;
  status: AttendanceStatus;
  createdAt: string;
  confirmedAt: string | null;
  eventDate: string;
  client: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
  };
  services: PortfolioLine[];
  products: PortfolioLine[];
  summary: {
    subtotal: number;
    servicesSubtotal: number;
    productsSubtotal: number;
    servicesDiscountPct: number;
    productsDiscountPct: number;
    discountPercentage: number;
    discountAmount: number;
    total: number;
  };
}