import api from "./api";
import type { Product } from "../types";

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get("/products");

    return response.data.data;
  },

  async getActive(): Promise<Product[]> {
    const response = await api.get("/products/active");

    return response.data.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);

    return response.data.data;
  },

  async create(
    data: Omit<Product, "id">
  ): Promise<Product> {
    const response = await api.post("/products", data);

    return response.data.data;
  },

  async update(
    id: number,
    data: Partial<Product>
  ): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};