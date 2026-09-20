import { Request, Response } from 'express';
import productService from '../services/product.service';

class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();

      return res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener los productos'
      });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const products = await productService.getActiveProducts();

      return res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Error al obtener los productos activos'
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

      const product = await productService.getProductById(id);

      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al obtener el producto';

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
          message: 'El nombre del producto es obligatorio'
        });
      }

      if (price === undefined || price === null) {
        return res.status(400).json({
          success: false,
          message: 'El precio del producto es obligatorio'
        });
      }

      const numericPrice = Number(price);

      if (isNaN(numericPrice)) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser numérico'
        });
      }

      const product = await productService.createProduct({
        name,
        description,
        price: numericPrice,
        active
      });

      return res.status(201).json({
        success: true,
        message: 'Producto creado correctamente',
        data: product
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al crear el producto';

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

      const product = await productService.updateProduct(id, {
        name,
        description,
        price: numericPrice,
        active
      });

      return res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        data: product
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el producto';

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

      await productService.deleteProduct(id);

      return res.json({
        success: true,
        message: 'Producto eliminado correctamente'
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al eliminar el producto';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }
}

export default new ProductController();