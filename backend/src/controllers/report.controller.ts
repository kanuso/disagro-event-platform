import { Request, Response } from 'express';
import reportService from '../services/report.service';

class ReportController {
  private getFilters(req: Request) {
    const { startDate, endDate, status } = req.query;

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'CANCELLED'
    ];

    if (
      status &&
      !validStatuses.includes(status as string)
    ) {
      throw new Error(
        'El estado debe ser PENDING, CONFIRMED o CANCELLED'
      );
    }

    return {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      status: status as
        | 'PENDING'
        | 'CONFIRMED'
        | 'CANCELLED'
        | undefined
    };
  }

  async getAttendanceReport(req: Request, res: Response) {
    try {
      const filters = this.getFilters(req);

      const report =
        await reportService.getAttendanceReport(filters);

      return res.json({
        success: true,
        message: 'Reporte de asistencias obtenido correctamente',
        data: report
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el reporte'
      });
    }
  }

  async getProductReport(req: Request, res: Response) {
    try {
      const filters = this.getFilters(req);

      const report =
        await reportService.getProductReport(filters);

      return res.json({
        success: true,
        message: 'Reporte de productos obtenido correctamente',
        data: report
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el reporte de productos'
      });
    }
  }

  async getServiceReport(req: Request, res: Response) {
    try {
      const filters = this.getFilters(req);

      const report =
        await reportService.getServiceReport(filters);

      return res.json({
        success: true,
        message: 'Reporte de servicios obtenido correctamente',
        data: report
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el reporte de servicios'
      });
    }
  }
}

export default new ReportController();