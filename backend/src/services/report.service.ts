import reportRepository from '../repositories/report.repository';

interface AttendanceReportFilters {
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

class ReportService {
  private parseFilters(filters: AttendanceReportFilters) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters.startDate) {
      startDate = new Date(`${filters.startDate}T00:00:00`);
    }

    if (filters.endDate) {
      endDate = new Date(`${filters.endDate}T23:59:59.999`);
    }

    if (startDate && isNaN(startDate.getTime())) {
      throw new Error('La fecha inicial no es válida');
    }

    if (endDate && isNaN(endDate.getTime())) {
      throw new Error('La fecha final no es válida');
    }

    if (startDate && endDate && startDate > endDate) {
      throw new Error(
        'La fecha inicial no puede ser mayor que la fecha final'
      );
    }

    return {
      startDate,
      endDate,
      status: filters.status
    };
  }

  async getAttendanceReport(filters: AttendanceReportFilters) {
    const parsedFilters = this.parseFilters(filters);

    const attendances =
      await reportRepository.getAttendanceReport(parsedFilters);

    const summary = {
      totalAttendances: attendances.length,

      pending: attendances.filter(
        (attendance) => attendance.status === 'PENDING'
      ).length,

      confirmed: attendances.filter(
        (attendance) => attendance.status === 'CONFIRMED'
      ).length,

      cancelled: attendances.filter(
        (attendance) => attendance.status === 'CANCELLED'
      ).length,

      subtotal: attendances.reduce(
        (total, attendance) =>
          total + Number(attendance.subtotal),
        0
      ),

      discounts: attendances.reduce(
        (total, attendance) =>
          total + Number(attendance.discountAmount),
        0
      ),

      total: attendances.reduce(
        (total, attendance) =>
          total + Number(attendance.total),
        0
      )
    };

    return {
      summary,
      attendances
    };
  }

  async getProductReport(filters: AttendanceReportFilters) {
    const parsedFilters = this.parseFilters(filters);

    const products =
      await reportRepository.getProductReport(parsedFilters);

    const grouped = new Map<
      number,
      {
        productId: number;
        productName: string;
        totalQuantity: number;
        totalAmount: number;
      }
    >();

    for (const item of products) {
      const existing = grouped.get(item.productId);

      const amount =
        Number(item.unitPrice) * item.quantity;

      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalAmount += amount;
      } else {
        grouped.set(item.productId, {
          productId: item.productId,
          productName: item.product.name,
          totalQuantity: item.quantity,
          totalAmount: amount
        });
      }
    }

    const result = Array.from(grouped.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return {
      totalProducts: result.length,
      products: result
    };
  }

  async getServiceReport(filters: AttendanceReportFilters) {
    const parsedFilters = this.parseFilters(filters);

    const services =
      await reportRepository.getServiceReport(parsedFilters);

    const grouped = new Map<
      number,
      {
        serviceId: number;
        serviceName: string;
        totalQuantity: number;
        totalAmount: number;
      }
    >();

    for (const item of services) {
      const existing = grouped.get(item.serviceId);

      const amount =
        Number(item.unitPrice) * item.quantity;

      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalAmount += amount;
      } else {
        grouped.set(item.serviceId, {
          serviceId: item.serviceId,
          serviceName: item.service.name,
          totalQuantity: item.quantity,
          totalAmount: amount
        });
      }
    }

    const result = Array.from(grouped.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return {
      totalServices: result.length,
      services: result
    };
  }
}

export default new ReportService();