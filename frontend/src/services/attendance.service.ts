import api from "./api";
import type {
  Attendance,
  CreateAttendanceRequest,
  CreatePublicAttendanceRequest,
  Portfolio,
} from "../types";

export const attendanceService = {
  async getAll(): Promise<Attendance[]> {
    const response = await api.get("/attendances");

    return response.data.data;
  },

  async getById(id: number): Promise<Attendance> {
    const response = await api.get(`/attendances/${id}`);

    return response.data.data;
  },

  async create(
    data: CreateAttendanceRequest
  ): Promise<Attendance> {
    const response = await api.post("/attendances", data);

    return response.data.data;
  },

  async confirm(id: number): Promise<Attendance> {
    const response = await api.patch(
      `/attendances/${id}/confirm`
    );

    return response.data.data;
  },

  async cancel(id: number): Promise<Attendance> {
    const response = await api.patch(
      `/attendances/${id}/cancel`
    );

    return response.data.data;
  },

    async createPublic(
    data: CreatePublicAttendanceRequest
  ): Promise<Attendance> {
    const response = await api.post("/attendances/public", data);
    return response.data.data;
  },

  async getPortfolio(id: number): Promise<Portfolio> {
    const response = await api.get(`/attendances/${id}/portfolio`);
    return response.data.data;
  },
};