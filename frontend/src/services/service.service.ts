import api from "./api";
import type { Service } from "../types";

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await api.get("/services");

    return response.data.data;
  },

  async getActive(): Promise<Service[]> {
    const response = await api.get("/services/active");

    return response.data.data;
  },

  async getById(id: number): Promise<Service> {
    const response = await api.get(`/services/${id}`);

    return response.data.data;
  },

  async create(
    data: Omit<Service, "id">
  ): Promise<Service> {
    const response = await api.post("/services", data);

    return response.data.data;
  },

  async update(
    id: number,
    data: Partial<Service>
  ): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};