import serviceRepository, {
  CreateServiceData,
  UpdateServiceData
} from '../repositories/service.repository';

class ServiceService {
  async getAllServices() {
    return serviceRepository.findAll();
  }

  async getActiveServices() {
    return serviceRepository.findActive();
  }

  async getServiceById(id: number) {
    const service = await serviceRepository.findById(id);

    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    return service;
  }

  async createService(data: CreateServiceData) {
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return serviceRepository.create(data);
  }

  async updateService(id: number, data: UpdateServiceData) {
    await this.getServiceById(id);

    if (data.price !== undefined && data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return serviceRepository.update(id, data);
  }

  async deleteService(id: number) {
    await this.getServiceById(id);

    return serviceRepository.delete(id);
  }
}

export default new ServiceService();