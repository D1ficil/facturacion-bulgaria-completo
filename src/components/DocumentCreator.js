import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Save, X, FileText, Search } from 'lucide-react';

// Componente de buscador autocomplete
const AutocompleteSearch = (props) => {
  const {
    items = [],
    value,
    onSelect,
    placeholder,
    displayField = 'name',
    searchFields = ['name'],
    onCreateNew,
    createNewText = "Създай нов"
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchTerm && items.length > 0) {
      const filtered = items.filter(item =>
        searchFields.some(field =>
          item[field] && item[field].toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredItems(filtered.slice(0, 10)); // Limitar a 10 resultados
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, items, searchFields]);

  useEffect(() => {
    if (value && items.length > 0) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        setSearchTerm(selectedItem[displayField]);
      }
    }
  }, [value, items, displayField]);

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
  };

  const handleSelectItem = (item) => {
    setSearchTerm(item[displayField]);
    setIsOpen(false);
    onSelect(item);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNew(searchTerm);
  };

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-l-md px-3 py-2 pr-8"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          title={createNewText}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <div>
                    <div className="font-medium">{item[displayField]}</div>
                    {item.eik && <div className="text-sm text-gray-500">ЕИК: {item.eik}</div>}
                    {item.code && <div className="text-sm text-gray-500">Код: {item.code}</div>}
                  </div>
                </button>
              ))}
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full px-4 py-2 text-left border-t border-gray-200 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  {createNewText} "{searchTerm}"
                </button>
              )}
            </>
          ) : searchTerm ? (
            <div className="px-4 py-2 text-gray-500">
              Не са намерени резултати
              <button
                type="button"
                onClick={handleCreateNew}
                className="block w-full text-left text-blue-600 hover:bg-blue-50 mt-2 p-2 rounded"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                {createNewText} "{searchTerm}"
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Modal para seleccionar tipo de documento
const DocumentTypeModal = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  const documentTypes = [
    {
      type: 'invoice',
      title: 'Фактура',
      description: 'Документ за продажба на стоки или услуги',
      icon: 'Ф',
      color: 'bg-blue-500'
    },
    {
      type: 'quote',
      title: 'Оферта',
      description: 'Предложение за цена за стоки или услуги',
      icon: 'О',
      color: 'bg-green-500'
    },
    {
      type: 'delivery',
      title: 'Стокова бележка',
      description: 'Документ за приемане/предаване на стока',
      icon: 'С',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Създай документ</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-3">
            {documentTypes.map((docType) => (
              <button
                key={docType.type}
                onClick={() => onSelect(docType.type)}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className={`w-10 h-10 ${docType.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                  {docType.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{docType.title}</h3>
                  <p className="text-sm text-gray-600">{docType.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para crear/editar cliente
const ClientModal = ({ isOpen, client = null, onSave, onClose, initialName = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    eik: '',
    vatNumber: '',
    address: '',
    city: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: initialName,
        eik: '',
        vatNumber: '',
        address: '',
        city: '',
        email: '',
        phone: ''
      });
    }
  }, [client, initialName]);

  const handleSubmit = () => {
    if (formData.name && formData.eik && formData.address && formData.city) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {client ? 'Редактирай клиент' : 'Нов клиент'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Име на фирма *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ЕИК *
                </label>
                <input
                  type="text"
                  value={formData.eik}
                  onChange={(e) => setFormData({...formData, eik: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ДДС номер
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Град *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имейл
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {client ? 'Запази' : 'Създай'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para crear/editar producto
const ProductModal = ({ isOpen, product = null, onSave, onClose, initialName = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    vatRate: '20',
    unit: 'бр.',
    description: ''
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: initialName,
        code: '',
        price: '',
        vatRate: '20',
        unit: 'бр.',
        description: ''
      });
    }
  }, [product, initialName]);

  const handleSubmit = () => {
    if (formData.name && formData.price) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {product ? 'Редактирай продукт' : 'Нов продукт'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Име на продукт/услуга *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Код
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Мерна единица
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ДДС %
                </label>
                <select
                  value={formData.vatRate}
                  onChange={(e) => setFormData({...formData, vatRate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="0">0%</option>
                  <option value="9">9%</option>
                  <option value="20">20%</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {product ? 'Запази' : 'Създай'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const DocumentCreator = ({ onClose }) => {
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [documentType, setDocumentType] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchingClientName, setSearchingClientName] = useState('');
  const [searchingProductName, setSearchingProductName] = useState('');
  
  const [formData, setFormData] = useState({
    clientId: '',
    documentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'BGN',
    language: 'bg',
    notes: '',
    noVat: false,
    vatExemptionReason: '',
    items: [
      {
        productId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20
      }
    ]
  });

  const [clients, setClients] = useState([
    { id: 1, name: 'ACME OOD', eik: '123456789', city: 'София' },
    { id: 2, name: 'Tech Solutions EOOD', eik: '987654321', city: 'Пловдив' },
    { id: 3, name: 'Marketing Pro OOD', eik: '555666777', city: 'Варна' }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: 'Консултантски услуги', code: 'CONS001', price: 100, vatRate: 20, unit: 'час' },
    { id: 2, name: 'Уеб дизайн', code: 'WEB001', price: 800, vatRate: 20, unit: 'проект' },
    { id: 3, name: 'SEO оптимизация', code: 'SEO001', price: 500, vatRate: 20, unit: 'месец' }
  ]);

  const vatExemptionReasons = [
    {
      code: 'art23_1',
      text: 'Чл. 23, ал. 1 - Доставки в друга държава-членка',
      description: 'При доставки на стоки в друга държава членка на ЕС'
    },
    {
      code: 'art69',
      text: 'Чл. 69 - Експортни доставки',
      description: 'При доставки на стоки за износ извън територията на ЕС'
    },
    {
      code: 'art45_1_1',
      text: 'Чл. 45, ал. 1, т. 1 - Застрахователни услуги',
      description: 'Застрахователни и презастрахователни услуги и операции'
    },
    {
      code: 'art45_1_2',
      text: 'Чл. 45, ал. 1, т. 2 - Банкови услуги',
      description: 'Предоставяне на кредити и посредничество при предоставяне на кредити'
    },
    {
      code: 'art45_1_8',
      text: 'Чл. 45, ал. 1, т. 8 - Медицински услуги',
      description: 'Лечебна дейност в областта на хуманната медицина'
    },
    {
      code: 'small_enterprise',
      text: 'Малко предприятие - под 50 000 лв. оборот',
      description: 'Регистрирано лице с оборот под 50 000 лв. за 12 месеца'
    }
  ];

  const getDocumentTitle = () => {
    const titles = {
      invoice: 'Създай фактура',
      quote: 'Създай оферта', 
      delivery: 'Създай стокова бележка'
    };
    return titles[documentType] || 'Създай документ';
  };

  const handleDocumentTypeSelect = (type) => {
    setDocumentType(type);
    setShowTypeModal(false);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let vatAmount = 0;

    formData.items.forEach(item => {
      const lineSubtotal = parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
      let lineVat = 0;
      
      if (!formData.noVat) {
        lineVat = lineSubtotal * (parseFloat(item.vatRate || 0) / 100);
      }
      
      subtotal += lineSubtotal;
      vatAmount += lineVat;
    });

    return {
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: (subtotal + vatAmount).toFixed(2)
    };
  };

  const handleSaveClient = async (clientData) => {
    const newClient = {
      ...clientData,
      id: editingClient ? editingClient.id : Date.now()
    };
    
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? newClient : c));
    } else {
      setClients([...clients, newClient]);
      setFormData({...formData, clientId: newClient.id});
    }
    
    setShowClientModal(false);
    setEditingClient(null);
    setSearchingClientName('');
  };

  const handleSaveProduct = async (productData) => {
    const newProduct = {
      ...productData,
      id: editingProduct ? editingProduct.id : Date.now(),
      price: parseFloat(productData.price)
    };
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    
    setShowProductModal(false);
    setEditingProduct(null);
    setSearchingProductName('');
  };

  const handleClientSelect = (client) => {
    setFormData({...formData, clientId: client.id});
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleProductSelect = (index, product) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      description: product.name,
      unitPrice: product.price,
      vatRate: product.vatRate
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          vatRate: 20
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const totals = calculateTotals();

  if (showTypeModal) {
    return (
      <DocumentTypeModal
        isOpen={showTypeModal}
        onSelect={handleDocumentTypeSelect}
        onClose={onClose}
      />
    );
  }

  if (!documentType) return null;

  return (
    <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {getDocumentTitle()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Отказ
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2 inline" />
                Запази
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Клиент *
              </label>
              <AutocompleteSearch
                items={clients}
                value={formData.clientId}
                onSelect={handleClientSelect}
                placeholder="Търси клиент..."
                searchFields={['name', 'eik']}
                onCreateNew={(name) => {
                  setSearchingClientName(name || '');
                  setShowClientModal(true);
                }}
                createNewText="Създай нов клиент"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата на документ *
              </label>
              <input
                type="date"
                value={formData.documentDate}
                onChange={(e) => setFormData({...formData, documentDate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Валута
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="BGN">BGN (лв.)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {documentType === 'invoice' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="noVat"
                  checked={formData.noVat}
                  onChange={(e) => setFormData({...formData, noVat: e.target.checked, vatExemptionReason: ''})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="noVat" className="ml-2 text-sm font-medium text-gray-900">
                  Не начислявай ДДС
                </label>
              </div>

              {formData.noVat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основание за освобождаване от ДДС *
                  </label>
                  <select
                    value={formData.vatExemptionReason}
                    onChange={(e) => setFormData({...formData, vatExemptionReason: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Избери основание...</option>
                    {vatExemptionReasons.map((reason) => (
                      <option key={reason.code} value={reason.code} title={reason.description}>
                        {reason.text}
                      </option>
                    ))}
                  </select>
                  {formData.vatExemptionReason && (
                    <p className="mt-1 text-xs text-gray-600">
                      {vatExemptionReasons.find(r => r.code === formData.vatExemptionReason)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Позиции</h3>
              <button
                onClick={addItem}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4 mr-1 inline" />
                Нов ред
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Описание
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Кол-во
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Цена
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ДДС %
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Сума
                    </th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => {
                    const lineSubtotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
                    const lineVat = formData.noVat ? 0 : lineSubtotal * (parseFloat(item.vatRate) / 100);
                    const lineTotal = lineSubtotal + lineVat;
                    
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2 w-80">
                          <AutocompleteSearch
                            items={products}
                            value={item.productId}
                            onSelect={(product) => handleProductSelect(index, product)}
                            placeholder="Търси продукт..."
                            searchFields={['name', 'code']}
                            onCreateNew={(name) => {
                              setSearchingProductName(name || '');
                              setShowProductModal(true);
                            }}
                            createNewText="Създай нов продукт"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                            rows="2"
                            placeholder="Описание..."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.vatRate}
                            onChange={(e) => handleItemChange(index, 'vatRate', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            disabled={formData.noVat}
                          >
                            <option value="0">0%</option>
                            <option value="9">9%</option>
                            <option value="20">20%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {lineTotal.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-64 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Междинна сума:</span>
                  <span>{totals.subtotal} {formData.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ДДС:</span>
                  <span>{formData.noVat ? '0.00' : totals.vatAmount} {formData.currency}</span>
                </div>
                {formData.noVat && formData.vatExemptionReason && (
                  <div className="text-xs text-gray-600 border-t pt-2">
                    <strong>Освободено от ДДС:</strong><br />
                    {vatExemptionReasons.find(r => r.code === formData.vatExemptionReason)?.text}
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>ОБЩО:</span>
                  <span>{totals.total} {formData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Бележки
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Допълнителни бележки..."
            />
          </div>
        </div>

        <ClientModal
          isOpen={showClientModal}
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => {
            setShowClientModal(false);
            setEditingClient(null);
          }}
          initialName={searchingClientName}
        />

        <ProductModal
          isOpen={showProductModal}
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          initialName={searchingProductName}
        />
      </div>
    </div>
  );
};

export default DocumentCreator;