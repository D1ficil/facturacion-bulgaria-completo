import api from './api';

class DocumentsService {
  async getAll(params = {}) {
    const response = await api.get('/documents', { params });
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }

  async create(documentData) {
    const response = await api.post('/documents', documentData);
    return response.data;
  }

  async update(id, documentData) {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }

  async updateStatus(id, status) {
    const response = await api.patch(`/documents/${id}/status`, { status });
    return response.data;
  }

  async downloadPDF(id) {
    const response = await api.get(`/documents/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async duplicate(id) {
    const response = await api.post(`/documents/${id}/duplicate`);
    return response.data;
  }

  // Helper methods for different document types
  async getInvoices(params = {}) {
    return this.getAll({ ...params, type: 'invoice' });
  }

  async getQuotes(params = {}) {
    return this.getAll({ ...params, type: 'quote' });
  }

  async getDeliveries(params = {}) {
    return this.getAll({ ...params, type: 'delivery' });
  }

  async getProformas(params = {}) {
    return this.getAll({ ...params, type: 'proforma' });
  }

  async convertQuoteToInvoice(quoteId) {
    const response = await api.post(`/documents/${quoteId}/convert-to-invoice`);
    return response.data;
  }
}

export const documentsService = new DocumentsService();