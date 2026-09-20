import { AttendanceStatus, Prisma } from '@prisma/client';
import prisma from '../config/prisma';

// ============================================================
// Tipos
// ============================================================

type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    client: true;
    services: { include: { service: true } };
    products: { include: { product: true } };
  };
}>;

export interface CreateAttendanceData {
  clientId: number;
  subtotal: number;
  servicesSubtotal: number;
  productsSubtotal: number;
  servicesDiscountPct: number;
  productsDiscountPct: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  status?: AttendanceStatus;
  confirmedAt?: Date | null;
}

export interface AttendanceLineService {
  serviceId: number;
  quantity: number;
  price: number;
}

export interface AttendanceLineProduct {
  productId: number;
  quantity: number;
  price: number;
}

export interface FindAllFilters {
  status?: AttendanceStatus;
  clientId?: number;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

// ============================================================
// Include reutilizable
// ============================================================

const INCLUDE_RELATIONS = {
  client: true,
  services: { include: { service: true } },
  products: { include: { product: true } },
} as const;

// ============================================================
// Repositorio
// ============================================================

class AttendanceRepository {
  async findAll(filters: FindAllFilters = {}): Promise<AttendanceWithRelations[]> {
    const { status, clientId, startDate, endDate, skip = 0, take = 50 } = filters;

    const where: Prisma.AttendanceWhereInput = {
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    return prisma.attendance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: INCLUDE_RELATIONS,
    });
  }

  async findById(id: number): Promise<AttendanceWithRelations | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
  }

  async create(
    data: CreateAttendanceData,
    services: AttendanceLineService[],
    products: AttendanceLineProduct[]
  ): Promise<AttendanceWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Crear la asistencia con TODOS los campos
      const attendance = await tx.attendance.create({
        data: {
          clientId: data.clientId,
          status: data.status ?? 'PENDING',
          subtotal: data.subtotal,
          servicesSubtotal: data.servicesSubtotal,
          productsSubtotal: data.productsSubtotal,
          servicesDiscountPct: data.servicesDiscountPct,
          productsDiscountPct: data.productsDiscountPct,
          discountPercentage: data.discountPercentage,
          discountAmount: data.discountAmount,
          total: data.total,
          confirmedAt: data.confirmedAt ?? null,
        },
      });

      // 2. Insertar servicios (con unitPrice)
      if (services.length > 0) {
        await tx.attendanceService.createMany({
          data: services.map((s) => ({
            attendanceId: attendance.id,
            serviceId: s.serviceId,
            quantity: s.quantity,
            unitPrice: s.price, // ← renombrado
          })),
        });
      }

      // 3. Insertar productos (con unitPrice)
      if (products.length > 0) {
        await tx.attendanceProduct.createMany({
          data: products.map((p) => ({
            attendanceId: attendance.id,
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: p.price, // ← renombrado
          })),
        });
      }

      // 4. Devolver con relaciones
      const created = await tx.attendance.findUnique({
        where: { id: attendance.id },
        include: INCLUDE_RELATIONS,
      });

      if (!created) throw new Error('Error al recuperar la asistencia creada');
      return created;
    });
  }

  async confirm(id: number): Promise<AttendanceWithRelations> {
    const attendance = await prisma.attendance.findUnique({ where: { id } });

    if (!attendance) throw new Error('Asistencia no encontrada');
    if (attendance.status === 'CONFIRMED') {
      throw new Error('La asistencia ya está confirmada');
    }
    if (attendance.status === 'CANCELLED') {
      throw new Error('No puedes confirmar una asistencia cancelada');
    }

    return prisma.attendance.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: INCLUDE_RELATIONS,
    });
  }

  async cancel(id: number): Promise<AttendanceWithRelations> {
    const attendance = await prisma.attendance.findUnique({ where: { id } });

    if (!attendance) throw new Error('Asistencia no encontrada');
    if (attendance.status === 'CANCELLED') {
      throw new Error('La asistencia ya está cancelada');
    }

    return prisma.attendance.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: INCLUDE_RELATIONS,
    });
  }
}

export default new AttendanceRepository();