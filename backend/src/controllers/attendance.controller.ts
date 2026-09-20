import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';
import { ZodError } from 'zod';
import { createAttendanceSchema } from '../validators/attendance.validator';


class AttendanceController {
  async getAll(req: Request, res: Response) {
    try {
      const attendances =
        await attendanceService.getAllAttendances();

      return res.json({
        success: true,
        data: attendances
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener las asistencias'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const attendance =
        await attendanceService.getAttendanceById(id);

      return res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al obtener la asistencia';

      return res.status(404).json({
        success: false,
        message
      });
    }
  }

async create(req: Request, res: Response) {
  try {
    const { clientId, services, products } = req.body;

    if (clientId === undefined || clientId === null) {
      return res.status(400).json({
        success: false,
        message: 'El cliente es obligatorio'
      });
    }

    const numericClientId = Number(clientId);
    if (isNaN(numericClientId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del cliente debe ser numérico'
      });
    }

    if (services !== undefined && !Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'services debe ser un arreglo'
      });
    }

    if (products !== undefined && !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'products debe ser un arreglo'
      });
    }

    const attendance = await attendanceService.createAttendance({
      clientId: numericClientId,
      services,
      products
    });

    return res.status(201).json({
      success: true,
      message: 'Asistencia registrada correctamente',
      data: attendance
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar la asistencia';
    return res.status(400).json({ success: false, message });
  }
}
  async confirm(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const attendance =
      await attendanceService.confirmAttendance(id);

    return res.json({
      success: true,
      message: 'Asistencia confirmada correctamente',
      data: attendance
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al confirmar la asistencia';

    return res.status(400).json({
      success: false,
      message
    });
  }
}

async cancel(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const attendance =
      await attendanceService.cancelAttendance(id);

    return res.json({
      success: true,
      message: 'Asistencia cancelada correctamente',
      data: attendance
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al cancelar la asistencia';

    return res.status(400).json({
      success: false,
      message
    });
  }
}

  // ==========================================================
  // FLUJO PÚBLICO
  // ==========================================================

  async createPublic(req: Request, res: Response) {
    try {
      const dto = createAttendanceSchema.parse(req.body);
      const attendance =
        await attendanceService.createPublicAttendance(dto);

      return res.status(201).json({
        success: true,
        message: 'Asistencia confirmada correctamente',
        data: attendance
      });
    } catch (error) {
if (error instanceof ZodError) {
  return res.status(400).json({
    success: false,
    message: 'Datos inválidos',
    errors: error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  });
}

      const message =
        error instanceof Error
          ? error.message
          : 'Error al confirmar la asistencia';

      return res.status(400).json({ success: false, message });
    }
  }

  async getPortfolio(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const portfolio = await attendanceService.getPortfolio(id);

      return res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al obtener el portafolio';

      return res.status(404).json({
        success: false,
        message
      });
    }
  }
}

export default new AttendanceController();