import { Request, Response } from 'express';
import serviceService from '../services/service.service';

class ServiceController {
  async getAll(req: Request, res: Response) {
    try {
      const services = await serviceService.getAllServices();

      return res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener los servicios'
      });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const services = await serviceService.getActiveServices();

      return res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener los servicios activos'
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

      const service = await serviceService.getServiceById(id);

      return res.json({
        success: true,
        data: service
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al obtener el servicio';

      return res.status(404).json({
        success: false,
        message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, active } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del servicio es obligatorio'
        });
      }

      if (price === undefined || price === null) {
        return res.status(400).json({
          success: false,
          message: 'El precio del servicio es obligatorio'
        });
      }

      const numericPrice = Number(price);

      if (isNaN(numericPrice)) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser numérico'
        });
      }

      const service = await serviceService.createService({
        name,
        description,
        price: numericPrice,
        active
      });

      return res.status(201).json({
        success: true,
        message: 'Servicio creado correctamente',
        data: service
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al crear el servicio';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const { name, description, price, active } = req.body;

      let numericPrice: number | undefined;

      if (price !== undefined) {
        numericPrice = Number(price);

        if (isNaN(numericPrice)) {
          return res.status(400).json({
            success: false,
            message: 'El precio debe ser numérico'
          });
        }
      }

      const service = await serviceService.updateService(id, {
        name,
        description,
        price: numericPrice,
        active
      });

      return res.json({
        success: true,
        message: 'Servicio actualizado correctamente',
        data: service
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el servicio';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await serviceService.deleteService(id);

      return res.json({
        success: true,
        message: 'Servicio eliminado correctamente'
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al eliminar el servicio';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }
}

export default new ServiceController();