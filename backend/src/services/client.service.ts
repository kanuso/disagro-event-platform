import clientRepository, {
  CreateClientData,
  UpdateClientData
} from '../repositories/client.repository';

class ClientService {
  async getAllClients() {
    return clientRepository.findAll();
  }

  async getClientById(id: number) {
    const client = await clientRepository.findById(id);

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    return client;
  }

  async createClient(data: CreateClientData) {
    const existingClient = await clientRepository.findByEmail(data.email);

    if (existingClient) {
      throw new Error('Ya existe un cliente con este correo electrónico');
    }

    return clientRepository.create(data);
  }

  async updateClient(id: number, data: UpdateClientData) {
    await this.getClientById(id);

    if (data.email) {
      const existingClient = await clientRepository.findByEmail(data.email);

      if (existingClient && existingClient.id !== id) {
        throw new Error('Ya existe un cliente con este correo electrónico');
      }
    }

    return clientRepository.update(id, data);
  }

  async deleteClient(id: number) {
    await this.getClientById(id);

    return clientRepository.delete(id);
  }
}

export default new ClientService();