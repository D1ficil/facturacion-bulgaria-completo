import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Mail, 
  ArrowRight, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';

// Modal de confirmación para convertir oferta a factura
const ConvertQuoteModal = ({ isOpen, quote, onConfirm, onClose }) => {
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (quote) {
      setNotes(`Фактура базирана на оферта ${quote.documentNumber}`);
      // Calcular fecha de vencimiento (30 días por defecto)
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [quote]);

  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Създай фактура от оферта
          </h2>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Оферта:</strong> {quote.documentNumber}<br />
              <strong>Клиент:</strong> {quote.client?.name}<br />
              <strong>Сума:</strong> {quote.total} {quote.currency}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата на фактура
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Падеж
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бележки
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => onConfirm({
                invoiceDate,
                dueDate,
                notes
              })}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Създай фактура
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Отказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de lista de documentos
const DocumentList = ({ onCreateDocument, onEditDocument }) => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      documentType: 'invoice',
      documentNumber: 'INV-2024-001',
      documentDate: '2024-09-15',
      dueDate: '2024-10-15',
      client: { id: 1, name: 'ACME OOD' },
      total: 1250.00,
      currency: 'BGN',
      status: 'paid',
      language: 'bg',
      convertedFromQuote: null,
      createdAt: '2024-09-15'
    },
    {
      id: 2,
      documentType: 'quote',
      documentNumber: 'QUO-2024-008',
      documentDate: '2024-09-14',
      client: { id: 2, name: 'Tech Solutions EOOD' },
      total: 3450.00,
      currency: 'BGN',
      status: 'sent',
      language: 'bg',
      validUntil: '2024-10-14',
      convertedToInvoice: null,
      createdAt: '2024-09-14'
    },
    {
      id: 3,
      documentType: 'invoice',
      documentNumber: 'INV-2024-002',
      documentDate: '2024-09-12',
      dueDate: '2024-10-12',
      client: { id: 3, name: 'Marketing Pro OOD' },
      total: 890.50,
      currency: 'BGN',
      status: 'overdue',
      language: 'bg',
      convertedFromQuote: 'QUO-2024-005',
      createdAt: '2024-09-12'
    },
    {
      id: 4,
      documentType: 'quote',
      documentNumber: 'QUO-2024-009',
      documentDate: '2024-09-10',
      client: { id: 4, name: 'Design Studio EOOD' },
      total: 2100.00,
      currency: 'BGN',
      status: 'draft',
      language: 'bg',
      validUntil: '2024-10-10',
      convertedToInvoice: null,
      createdAt: '2024-09-10'
    },
    {
      id: 5,
      documentType: 'delivery',
      documentNumber: 'DEL-2024-003',
      documentDate: '2024-09-08',
      client: { id: 1, name: 'ACME OOD' },
      total: 0, // Delivery notes don't have amounts
      currency: 'BGN',
      status: 'delivered',
      language: 'bg',
      createdAt: '2024-09-08'
    }
  ]);

  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Filtrar documentos cuando cambian los filtros
  useEffect(() => {
    let filtered = documents;

    if (filters.type !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(doc =>
        doc.documentNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.client.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, filters]);

  // Obtener texto del tipo de documento
  const getDocumentTypeText = (type) => {
    const types = {
      invoice: 'Фактура',
      quote: 'Оферта',
      delivery: 'Стокова бележка',
      proforma: 'Проформа'
    };
    return types[type] || type;
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      delivered: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Obtener texto del estado
  const getStatusText = (status, type) => {
    const statusTexts = {
      draft: 'Чернова',
      sent: type === 'quote' ? 'Изпратена' : 'Изпратена',
      paid: 'Платена',
      overdue: 'Просрочена',
      cancelled: 'Отменена',
      delivered: 'Доставена',
      accepted: 'Приета',
      rejected: 'Отхвърлена'
    };
    return statusTexts[status] || status;
  };

  // Obtener icono del estado
  const getStatusIcon = (status) => {
    const icons = {
      draft: <Clock className="h-4 w-4" />,
      sent: <Mail className="h-4 w-4" />,
      paid: <CheckCircle className="h-4 w-4" />,
      overdue: <AlertCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      accepted: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  // Convertir oferta a factura
  const handleConvertQuote = (quote) => {
    setSelectedQuote(quote);
    setShowConvertModal(true);
  };

  // Confirmar conversión de oferta a factura
  const handleConfirmConversion = (conversionData) => {
    if (selectedQuote) {
      // Crear nueva factura basada en la oferta
      const newInvoice = {
        id: Math.max(...documents.map(d => d.id)) + 1,
        documentType: 'invoice',
        documentNumber: `INV-2024-${String(documents.filter(d => d.documentType === 'invoice').length + 1).padStart(3, '0')}`,
        documentDate: conversionData.invoiceDate,
        dueDate: conversionData.dueDate,
        client: selectedQuote.client,
        total: selectedQuote.total,
        currency: selectedQuote.currency,
        status: 'draft',
        language: selectedQuote.language,
        notes: conversionData.notes,
        convertedFromQuote: selectedQuote.documentNumber,
        items: selectedQuote.items || [], // Copy items from quote
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Marcar la oferta como convertida
      const updatedQuote = {
        ...selectedQuote,
        convertedToInvoice: newInvoice.documentNumber,
        status: 'accepted'
      };

      // Actualizar lista de documentos
      setDocuments([
        ...documents.map(doc => 
          doc.id === selectedQuote.id ? updatedQuote : doc
        ),
        newInvoice
      ]);

      setShowConvertModal(false);
      setSelectedQuote(null);

      // Opcional: mostrar notificación de éxito
      alert(`Фактура ${newInvoice.documentNumber} създадена успешно от оферта ${selectedQuote.documentNumber}`);
    }
  };

  // Cambiar estado de documento
  const handleStatusChange = (document, newStatus) => {
    setDocuments(documents.map(doc => 
      doc.id === document.id 
        ? { ...doc, status: newStatus }
        : doc
    ));
  };

  // Calcular estadísticas (solo facturas contabilizan como ventas)
  const getStatistics = () => {
    const invoices = documents.filter(doc => doc.documentType === 'invoice');
    const quotes = documents.filter(doc => doc.documentType === 'quote');
    
    return {
      totalInvoices: invoices.length,
      totalRevenue: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      pendingInvoices: invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length,
      activeQuotes: quotes.filter(q => q.status === 'sent' || q.status === 'draft').length,
      convertibleQuotes: quotes.filter(q => q.status === 'sent' && !q.convertedToInvoice).length
    };
  };

  const stats = getStatistics();

  return (
    <div className="p-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Общо фактури</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Приходи (лв.)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Чакащи плащания</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Активни оферти</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeQuotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ArrowRight className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">За фактуриране</p>
              <p className="text-2xl font-bold text-gray-900">{stats.convertibleQuotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Филтри:</span>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Всички типове</option>
            <option value="invoice">Фактури</option>
            <option value="quote">Оферти</option>
            <option value="delivery">Стокови бележки</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Всички статуси</option>
            <option value="draft">Чернова</option>
            <option value="sent">Изпратени</option>
            <option value="paid">Платени</option>
            <option value="overdue">Просрочени</option>
          </select>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Търси по номер или клиент..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-9 pr-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => onCreateDocument()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="h-4 w-4 mr-1 inline" />
            Нов документ
          </button>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Документ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сума
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.documentNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDocumentTypeText(document.documentType)}
                        </div>
                        {document.convertedFromQuote && (
                          <div className="text-xs text-blue-600">
                            От оферта: {document.convertedFromQuote}
                          </div>
                        )}
                        {document.convertedToInvoice && (
                          <div className="text-xs text-green-600">
                            Фактурирана: {document.convertedToInvoice}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.documentDate}
                    {document.dueDate && document.documentType === 'invoice' && (
                      <div className="text-xs">
                        Падеж: {document.dueDate}
                      </div>
                    )}
                    {document.validUntil && document.documentType === 'quote' && (
                      <div className="text-xs">
                        Валидна до: {document.validUntil}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.documentType !== 'delivery' && (
                      <>
                        {document.total.toFixed(2)} {document.currency}
                        {document.documentType === 'quote' && !document.convertedToInvoice && (
                          <div className="text-xs text-orange-600">
                            Не е фактурирана
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      <span className="ml-1">{getStatusText(document.status, document.documentType)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* Ver documento */}}
                        className="text-blue-600 hover:text-blue-900"
                        title="Преглед"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditDocument(document)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Редактиране"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* Descargar PDF */}}
                        className="text-green-600 hover:text-green-900"
                        title="Изтегли PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {document.documentType === 'quote' && !document.convertedToInvoice && document.status === 'sent' && (
                        <button
                          onClick={() => handleConvertQuote(document)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Създай фактура"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {/* Eliminar */}}
                        className="text-red-600 hover:text-red-900"
                        title="Изтрий"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Няма намерени документи
          </div>
        )}
      </div>

      {/* Modal de conversión */}
      <ConvertQuoteModal
        isOpen={showConvertModal}
        quote={selectedQuote}
        onConfirm={handleConfirmConversion}
        onClose={() => {
          setShowConvertModal(false);
          setSelectedQuote(null);
        }}
      />
    </div>
  );
};

export default DocumentList;