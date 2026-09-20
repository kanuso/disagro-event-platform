import prisma from '../config/prisma';

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  active?: boolean;
}

class ServiceRepository {
  async findAll() {
    return prisma.service.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findActive() {
    return prisma.service.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findById(id: number) {
    return prisma.service.findUnique({
      where: {
        id
      }
    });
  }

  async create(data: CreateServiceData) {
    return prisma.service.create({
      data
    });
  }

  async update(id: number, data: UpdateServiceData) {
    return prisma.service.update({
      where: {
        id
      },
      data
    });
  }
  async findActiveByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.service.findMany({
    where: {
      id: { in: ids },
      active: true,
    },
  });
}

  async delete(id: number) {
    return prisma.service.delete({
      where: {
        id
      }
    });
  }
}

export default new ServiceRepository();