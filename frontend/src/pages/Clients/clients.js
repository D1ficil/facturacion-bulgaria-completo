import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ClientForm from '../../components/Forms/ClientForm';
import Modal from '../../components/Common/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Clients = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients', {
        params: {
          page: currentPage,
          limit: 10
        }
      });
      setClients(response.data.clients);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Грешка при зареждане на клиентите');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този клиент?')) {
      try {
        await api.delete(`/clients/${id}`);
        toast.success('Клиентът е изтрит успешно');
        fetchClients();
      } catch (error) {
        toast.error('Грешка при изтриване на клиента');
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, data);
        toast.success('Клиентът е актуализиран успешно');
      } else {
        await api.post('/clients', data);
        toast.success('Клиентът е добавен успешно');
      }
      setShowModal(false);
      fetchClients();
    } catch (error) {
      toast.error('Грешка при запазване на клиента');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.eik.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('clients.clients')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управлявайте вашите клиенти и техните данни
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddClient}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('clients.addClient')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('clients.searchClients')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма клиенти</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете чрез добавяне на нов клиент.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddClient}
                className="btn btn-primary"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Добави клиент
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Име</th>
                  <th>ЕИК</th>
                  <th>Град</th>
                  <th>Имейл</th>
                  <th>Телефон</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          {client.vatNumber && (
                            <div className="text-sm text-gray-500">
                              ДДС: {client.vatNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">{client.eik}</td>
                    <td className="text-sm text-gray-500">{client.city}</td>
                    <td className="text-sm text-gray-500">{client.email || '-'}</td>
                    <td className="text-sm text-gray-500">{client.phone || '-'}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Редактирай"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Изтрий"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Предишна
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Следваща
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Страница <span className="font-medium">{currentPage}</span> от{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClient ? t('clients.editClient') : t('clients.addClient')}
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Clients;