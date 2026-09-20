import prisma from '../config/prisma';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

class ReportRepository {
  private buildAttendanceWhere(filters: ReportFilters) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  async getAttendanceReport(filters: ReportFilters) {
    const where = this.buildAttendanceWhere(filters);

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        client: true,
        services: {
          include: {
            service: true
          }
        },
        products: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return attendances;
  }

  async getProductReport(filters: ReportFilters) {
    const where = this.buildAttendanceWhere(filters);

    const products = await prisma.attendanceProduct.findMany({
      where: {
        attendance: where
      },
      include: {
        product: true,
        attendance: true
      }
    });

    return products;
  }

  async getServiceReport(filters: ReportFilters) {
    const where = this.buildAttendanceWhere(filters);

    const services = await prisma.attendanceService.findMany({
      where: {
        attendance: where
      },
      include: {
        service: true,
        attendance: true
      }
    });

    return services;
  }
}

export default new ReportRepository();