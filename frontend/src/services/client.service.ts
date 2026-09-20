import api from "./api";
import type { Client } from "../types";

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await api.get("/clients");

    return response.data.data;
  },

  async getById(id: number): Promise<Client> {
    const response = await api.get(`/clients/${id}`);

    return response.data.data;
  },

  async create(data: Omit<Client, "id">): Promise<Client> {
    const response = await api.post("/clients", data);

    return response.data.data;
  },

  async update(id: number, data: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data);

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};