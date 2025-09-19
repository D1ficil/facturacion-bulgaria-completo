import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { documentsService } from '../../services/documentsService';
import toast from 'react-hot-toast';

const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        type: 'invoice'
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await documentsService.getInvoices(params);
      setInvoices(response.documents);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Грешка при зареждане на фактурите');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await documentsService.updateStatus(id, newStatus);
      toast.success('Статусът е актуализиран');
      fetchInvoices();
    } catch (error) {
      toast.error('Грешка при актуализиране на статуса');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази фактура?')) {
      try {
        await documentsService.delete(id);
        toast.success('Фактурата е изтрита');
        fetchInvoices();
      } catch (error) {
        toast.error('Грешка при изтриване на фактурата');
      }
    }
  };

  const handleDownloadPDF = async (id, documentNumber) => {
    try {
      const pdfBlob = await documentsService.downloadPDF(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Грешка при изтегляне на PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      draft: 'Чернова',
      sent: 'Изпратена',
      paid: 'Платена',
      overdue: 'Просрочена',
      cancelled: 'Отменена'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('documents.invoices')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управлявайте вашите фактури
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/documents/create/invoice"
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('documents.createInvoice')}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Търси по номер или клиент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">Всички статуси</option>
              <option value="draft">Чернова</option>
              <option value="sent">Изпратена</option>
              <option value="paid">Платена</option>
              <option value="overdue">Просрочена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <input
              type="date"
              className="input"
              placeholder="От дата"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Клиент</th>
                  <th>Дата</th>
                  <th>Краен срок</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="font-medium text-gray-900">
                      {invoice.documentNumber}
                    </td>
                    <td className="text-gray-900">
                      {invoice.client?.name}
                    </td>
                    <td className="text-gray-500">
                      {new Date(invoice.documentDate).toLocaleDateString('bg-BG')}
                    </td>
                    <td className="text-gray-500">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('bg-BG') : '-'}
                    </td>
                    <td className="font-medium text-gray-900">
                      {parseFloat(invoice.total).toFixed(2)} {invoice.currency}
                    </td>
                    <td>
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadPDF(invoice.id, invoice.documentNumber)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Изтегли PDF"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5" />
                        </button>
                        
                        <Link
                          to={`/documents/${invoice.id}/edit`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Редактирай"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
    </div>
  );
};

export default Invoices;