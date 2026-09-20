import { Request, Response } from 'express';
import clientService from '../services/client.service';

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await clientService.getAllClients();

      return res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener los clientes'
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

      const client = await clientService.getClientById(id);

      return res.json({
        success: true,
        data: client
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al obtener el cliente';

      return res.status(404).json({
        success: false,
        message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, email, phone, company } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y el correo electrónico son obligatorios'
        });
      }

      const client = await clientService.createClient({
        name,
        email,
        phone,
        company
      });

      return res.status(201).json({
        success: true,
        message: 'Cliente creado correctamente',
        data: client
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear el cliente';

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

      const { name, email, phone, company } = req.body;

      const client = await clientService.updateClient(id, {
        name,
        email,
        phone,
        company
      });

      return res.json({
        success: true,
        message: 'Cliente actualizado correctamente',
        data: client
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el cliente';

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

      await clientService.deleteClient(id);

      return res.json({
        success: true,
        message: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el cliente';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }
}

export default new ClientController();