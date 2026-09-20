import attendanceRepository from '../repositories/attendance.repository';
import clientRepository from '../repositories/client.repository';
import prisma from '../config/prisma';
import discountService from './discount.service';
import type { CreateAttendanceDto } from '../validators/attendance.validator';

// ============================================================
// Tipos
// ============================================================

interface CreateAttendanceData {
  clientId: number;
  services?: Array<{ serviceId: number; quantity: number }>;
  products?: Array<{ productId: number; quantity: number }>;
}

class AttendanceService {
  // ==========================================================
  // LECTURA
  // ==========================================================

  async getAllAttendances() {
    return attendanceRepository.findAll();
  }

  async getAttendanceById(id: number) {
    const attendance = await attendanceRepository.findById(id);

    if (!attendance) {
      throw new Error('Asistencia no encontrada');
    }

    return attendance;
  }

  // ==========================================================
  // FLUJO ADMIN: crear asistencia para un cliente existente
  // ==========================================================

  async createAttendance(data: CreateAttendanceData) {
    const servicesData = data.services || [];
    const productsData = data.products || [];

    if (servicesData.length === 0 && productsData.length === 0) {
      throw new Error(
        'La asistencia debe incluir al menos un servicio o producto'
      );
    }

    for (const service of servicesData) {
      if (!Number.isInteger(service.quantity) || service.quantity <= 0) {
        throw new Error(
          'La cantidad de cada servicio debe ser un número entero mayor a 0'
        );
      }
    }

    for (const product of productsData) {
      if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
        throw new Error(
          'La cantidad de cada producto debe ser un número entero mayor a 0'
        );
      }
    }

    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) throw new Error('Cliente no encontrado');

    const serviceIds = servicesData.map((s) => s.serviceId);
    const productIds = productsData.map((p) => p.productId);

    if (new Set(serviceIds).size !== serviceIds.length) {
      throw new Error('No se puede agregar el mismo servicio más de una vez');
    }
    if (new Set(productIds).size !== productIds.length) {
      throw new Error('No se puede agregar el mismo producto más de una vez');
    }

    const services =
      serviceIds.length > 0
        ? await prisma.service.findMany({
            where: { id: { in: serviceIds }, active: true },
          })
        : [];

    if (services.length !== serviceIds.length) {
      throw new Error('Uno o más servicios no existen o están inactivos');
    }

    const products =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: productIds }, active: true },
          })
        : [];

    if (products.length !== productIds.length) {
      throw new Error('Uno o más productos no existen o están inactivos');
    }

    // ---- Calcular subtotales y cantidades ----
    let servicesSubtotal = 0;
    const attendanceServices = services.map((service) => {
      const selected = servicesData.find((s) => s.serviceId === service.id);
      const quantity = selected?.quantity ?? 1;
      servicesSubtotal += Number(service.price) * quantity;
      return {
        serviceId: service.id,
        quantity,
        price: Number(service.price),
      };
    });
    const servicesCount = attendanceServices.length;

    let productsSubtotal = 0;
    const attendanceProducts = products.map((product) => {
      const selected = productsData.find((p) => p.productId === product.id);
      const quantity = selected?.quantity ?? 1;
      productsSubtotal += Number(product.price) * quantity;
      return {
        productId: product.id,
        quantity,
        price: Number(product.price),
      };
    });
    const productsCount = attendanceProducts.length;

    // ---- Calcular descuento ----
    const discount = discountService.calculate({
      servicesSubtotal,
      productsSubtotal,
      servicesCount,
      productsCount,
    });

    // ---- Persistir con TODOS los campos ----
    return attendanceRepository.create(
      {
        clientId: data.clientId,
        subtotal: discount.subtotal,
        servicesSubtotal: discount.servicesSubtotal,
        productsSubtotal: discount.productsSubtotal,
        servicesDiscountPct: discount.servicesDiscountPct,
        productsDiscountPct: discount.productsDiscountPct,
        discountPercentage: discount.discountPercentage,
        discountAmount: discount.discountAmount,
        total: discount.total,
        status: 'PENDING', // ← flujo admin: nace pendiente
      },
      attendanceServices,
      attendanceProducts
    );
  }

  // ==========================================================
  // FLUJO PÚBLICO: el cliente confirma desde el formulario
  // ==========================================================

  async createPublicAttendance(dto: CreateAttendanceDto) {
    const servicesData = dto.services;
    const productsData = dto.products;

    if (servicesData.length === 0 && productsData.length === 0) {
      throw new Error('Debes seleccionar al menos un servicio o producto');
    }

    // ---- Validar cantidades ----
    for (const s of servicesData) {
      if (!Number.isInteger(s.quantity) || s.quantity <= 0) {
        throw new Error('La cantidad de cada servicio debe ser un entero > 0');
      }
    }
    for (const p of productsData) {
      if (!Number.isInteger(p.quantity) || p.quantity <= 0) {
        throw new Error('La cantidad de cada producto debe ser un entero > 0');
      }
    }

    // ---- Validar duplicados ----
    const serviceIds = servicesData.map((s) => s.serviceId);
    const productIds = productsData.map((p) => p.productId);

    if (new Set(serviceIds).size !== serviceIds.length) {
      throw new Error('No se puede agregar el mismo servicio más de una vez');
    }
    if (new Set(productIds).size !== productIds.length) {
      throw new Error('No se puede agregar el mismo producto más de una vez');
    }

    // ---- Cargar servicios ----
    const services =
      serviceIds.length > 0
        ? await prisma.service.findMany({
            where: { id: { in: serviceIds }, active: true },
          })
        : [];

    if (services.length !== serviceIds.length) {
      throw new Error('Uno o más servicios no existen o están inactivos');
    }

    // ---- Cargar productos ----
    const products =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: productIds }, active: true },
          })
        : [];

    if (products.length !== productIds.length) {
      throw new Error('Uno o más productos no existen o están inactivos');
    }

    // ---- Upsert del cliente ----
    const client = await clientRepository.upsertByEmail({
      name: dto.client.name,
      email: dto.client.email,
      phone: dto.client.phone,
      company: dto.client.company,
    });

    // ---- Calcular subtotales ----
    let servicesSubtotal = 0;
    const attendanceServices = services.map((service) => {
      const selected = servicesData.find((s) => s.serviceId === service.id)!;
      servicesSubtotal += Number(service.price) * selected.quantity;
      return {
        serviceId: service.id,
        quantity: selected.quantity,
        price: Number(service.price),
      };
    });
    const servicesCount = attendanceServices.length;

    let productsSubtotal = 0;
    const attendanceProducts = products.map((product) => {
      const selected = productsData.find((p) => p.productId === product.id)!;
      productsSubtotal += Number(product.price) * selected.quantity;
      return {
        productId: product.id,
        quantity: selected.quantity,
        price: Number(product.price),
      };
    });
    const productsCount = attendanceProducts.length;

    // ---- Calcular descuento ----
    const discount = discountService.calculate({
      servicesSubtotal,
      productsSubtotal,
      servicesCount,
      productsCount,
    });

    // ---- Crear asistencia CONFIRMADA ----
    return attendanceRepository.create(
      {
        clientId: client.id,
        subtotal: discount.subtotal,
        servicesSubtotal: discount.servicesSubtotal,
        productsSubtotal: discount.productsSubtotal,
        servicesDiscountPct: discount.servicesDiscountPct,
        productsDiscountPct: discount.productsDiscountPct,
        discountPercentage: discount.discountPercentage,
        discountAmount: discount.discountAmount,
        total: discount.total,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      attendanceServices,
      attendanceProducts
    );
  }

  // ==========================================================
  // PORTAFOLIO PERSONALIZADO
  // ==========================================================

  async getPortfolio(attendanceId: number) {
    const attendance = await attendanceRepository.findById(attendanceId);

    if (!attendance) {
      throw new Error('Asistencia no encontrada');
    }

    return {
      id: attendance.id,
      status: attendance.status,
      createdAt: attendance.createdAt,
      confirmedAt: attendance.confirmedAt,
      eventDate: '2026-12-15', 

      client: {
        id: attendance.client.id,
        name: attendance.client.name,
        email: attendance.client.email,
        phone: attendance.client.phone,
        company: attendance.client.company,
      },

      services: attendance.services.map((s) => ({
        id: s.service.id,
        name: s.service.name,
        description: s.service.description,
        unitPrice: Number(s.unitPrice),
        quantity: s.quantity,
        lineTotal: Number(s.unitPrice) * s.quantity,
      })),

      products: attendance.products.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        description: p.product.description,
        unitPrice: Number(p.unitPrice),
        quantity: p.quantity,
        lineTotal: Number(p.unitPrice) * p.quantity,
      })),

      summary: {
        subtotal: Number(attendance.subtotal),
        servicesSubtotal: Number(attendance.servicesSubtotal),
        productsSubtotal: Number(attendance.productsSubtotal),
        servicesDiscountPct: Number(attendance.servicesDiscountPct),
        productsDiscountPct: Number(attendance.productsDiscountPct),
        discountPercentage: Number(attendance.discountPercentage),
        discountAmount: Number(attendance.discountAmount),
        total: Number(attendance.total),
      },
    };
  }

  // ==========================================================
  // CAMBIO DE ESTADO
  // ==========================================================

  async confirmAttendance(id: number) {
    const attendance = await this.getAttendanceById(id);

    if (attendance.status === 'CONFIRMED') {
      throw new Error('La asistencia ya está confirmada');
    }

    if (attendance.status === 'CANCELLED') {
      throw new Error('No se puede confirmar una asistencia cancelada');
    }

    return attendanceRepository.confirm(id);
  }

  async cancelAttendance(id: number) {
    const attendance = await this.getAttendanceById(id);

    if (attendance.status === 'CANCELLED') {
      throw new Error('La asistencia ya está cancelada');
    }

    return attendanceRepository.cancel(id);
  }
}

export default new AttendanceService();