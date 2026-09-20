import api from "./api";

export interface ProductReport {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface ServiceReport {
  serviceId: number;
  serviceName: string;
  totalQuantity: number;
  totalAmount: number;
}

export const reportService = {
  async getAttendances() {
    const response = await api.get("/reports/attendances");

    return response.data.data;
  },

  async getProducts(): Promise<ProductReport[]> {
    const response = await api.get("/reports/products");

    return response.data.data.products;
  },

  async getServices(): Promise<ServiceReport[]> {
    const response = await api.get("/reports/services");

    return response.data.data.services;
  },
};