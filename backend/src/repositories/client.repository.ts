import prisma from '../config/prisma';

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

class ClientRepository {
  async findAll() {
    return prisma.client.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: number) {
    return prisma.client.findUnique({
      where: {
        id
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.client.findUnique({
      where: {
        email
      }
    });
  }

  async create(data: CreateClientData) {
    return prisma.client.create({
      data
    });
  }

  async update(id: number, data: UpdateClientData) {
    return prisma.client.update({
      where: {
        id
      },
      data
    });
  }

  async upsertByEmail(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}) {
  return prisma.client.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone,
      company: data.company,
    },
    create: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
    },
  });
}

  async delete(id: number) {
    return prisma.client.delete({
      where: {
        id
      }
    });
  }
}

export default new ClientRepository();