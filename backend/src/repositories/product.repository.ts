import prisma from '../config/prisma';

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  active?: boolean;
}

class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findActive() {
    return prisma.product.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findById(id: number) {
    return prisma.product.findUnique({
      where: {
        id
      }
    });
  }

  async create(data: CreateProductData) {
    return prisma.product.create({
      data
    });
  }

  async update(id: number, data: UpdateProductData) {
    return prisma.product.update({
      where: {
        id
      },
      data
    });
  }
  async findActiveByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: {
      id: { in: ids },
      active: true,
    },
  });
}

  async delete(id: number) {
    return prisma.product.delete({
      where: {
        id
      }
    });
  }
}

export default new ProductRepository();