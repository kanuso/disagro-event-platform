import productRepository, {
  CreateProductData,
  UpdateProductData
} from '../repositories/product.repository';

class ProductService {
  async getAllProducts() {
    return productRepository.findAll();
  }

  async getActiveProducts() {
    return productRepository.findActive();
  }

  async getProductById(id: number) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return product;
  }

  async createProduct(data: CreateProductData) {
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return productRepository.create(data);
  }

  async updateProduct(id: number, data: UpdateProductData) {
    await this.getProductById(id);

    if (data.price !== undefined && data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    await this.getProductById(id);

    return productRepository.delete(id);
  }
}

export default new ProductService();