const moment = require('moment');

// Generar número de documento automático
exports.generateDocumentNumber = async (companyId, documentType) => {
  const { Document } = require('../models');
  
  try {
    // Obtener el último documento del tipo
    const lastDoc = await Document.findOne({
      where: { 
        companyId, 
        documentType 
      },
      order: [['id', 'DESC']]
    });

    let nextNumber = 1;
    let prefix = '';

    switch (documentType) {
      case 'invoice':
        prefix = 'INV-';
        break;
      case 'quote':
        prefix = 'PRES-';
        break;
      case 'delivery':
        prefix = 'ALB-';
        break;
      case 'proforma':
        prefix = 'PRO-';
        break;
      default:
        prefix = 'DOC-';
    }

    if (lastDoc) {
      // Extraer número del último documento
      const lastNumber = parseInt(lastDoc.documentNumber.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generando número de documento:', error);
    return `${prefix}${String(Date.now()).slice(-6)}`;
  }
};

// Formatear moneda
exports.formatCurrency = (amount, currency = 'BGN') => {
  const formatter = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
};

// Formatear fecha
exports.formatDate = (date, locale = 'bg-BG') => {
  return moment(date).locale(locale).format('DD.MM.YYYY');
};

// Validar EIK búlgaro
exports.validateEIK = (eik) => {
  if (!eik) return false;
  
  // Remover espacios y guiones
  const cleanEIK = eik.replace(/[\s-]/g, '');
  
  // Verificar longitud (9 o 13 dígitos)
  if (!/^\d{9}$|^\d{13}$/.test(cleanEIK)) {
    return false;
  }

  // Algoritmo de validación para EIK de 9 dígitos
  if (cleanEIK.length === 9) {
    const weights = [1, 2, 3, 4, 5, 6, 7, 8];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleanEIK[i]) * weights[i];
    }
    
    let remainder = sum % 11;
    if (remainder === 10) {
      const weights2 = [3, 4, 5, 6, 7, 8, 9, 10];
      sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(cleanEIK[i]) * weights2[i];
      }
      remainder = sum % 11;
      if (remainder === 10) remainder = 0;
    }
    
    return remainder === parseInt(cleanEIK[8]);
  }
  
  return true; // Para EIK de 13 dígitos, validación simplificada
};

// Calcular fecha de vencimiento
exports.calculateDueDate = (documentDate, paymentDays = 30) => {
  return moment(documentDate).add(paymentDays, 'days').toDate();
};

// Obtener estado del documento basado en fechas
exports.getDocumentStatus = (document) => {
  if (document.status === 'paid' || document.status === 'cancelled') {
    return document.status;
  }
  
  if (document.dueDate && moment().isAfter(moment(document.dueDate))) {
    return 'overdue';
  }
  
  return document.status;
};

// Generar código de producto automático
exports.generateProductCode = async (companyId, productName) => {
  const { Product } = require('../models');
  
  try {
    // Crear código basado en las primeras letras del nombre
    const words = productName.split(' ');
    let baseCode = '';
    
    words.forEach(word => {
      if (baseCode.length < 3 && word.length > 0) {
        baseCode += word.charAt(0).toUpperCase();
      }
    });
    
    if (baseCode.length < 3) {
      baseCode = productName.substring(0, 3).toUpperCase();
    }
    
    // Verificar si el código ya existe
    let counter = 1;
    let finalCode = baseCode + String(counter).padStart(3, '0');
    
    while (true) {
      const existing = await Product.findOne({
        where: { companyId, code: finalCode }
      });
      
      if (!existing) break;
      
      counter++;
      finalCode = baseCode + String(counter).padStart(3, '0');
    }
    
    return finalCode;
  } catch (error) {
    console.error('Error generando código de producto:', error);
    return 'PROD' + String(Date.now()).slice(-3);
  }
};

// Convertir número a palabras (búlgaro)
exports.numberToWordsBG = (number) => {
  const ones = ['', 'един', 'два', 'три', 'четири', 'пет', 'шест', 'седем', 'осем', 'девет'];
  const teens = ['десет', 'единадесет', 'дванадесет', 'тринадесет', 'четиринадесет', 
                'петнадесет', 'шестнадесет', 'седемнадесет', 'осемнадесет', 'деветнадесет'];
  const tens = ['', '', 'двадесет', 'тридесет', 'четиридесет', 'петдесет', 
               'шестдесет', 'седемдесет', 'осемдесет', 'деветдесет'];
  const hundreds = ['', 'сто', 'двеста', 'триста', 'четиристотин', 'петстотин',
                   'шестстотин', 'седемстотин', 'осемстотин', 'деветстотин'];

  if (number === 0) return 'нула';
  
  const convertGroup = (n) => {
    let result = '';
    
    if (n >= 100) {
      result += hundreds[Math.floor(n / 100)] + ' ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      n = 0;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result.trim();
  };

  const integer = Math.floor(number);
  const decimal = Math.round((number - integer) * 100);
  
  let result = '';
  
  if (integer >= 1000000) {
    const millions = Math.floor(integer / 1000000);
    result += convertGroup(millions) + ' милион' + (millions > 1 ? 'а' : '') + ' ';
    integer %= 1000000;
  }
  
  if (integer >= 1000) {
    const thousands = Math.floor(integer / 1000);
    result += convertGroup(thousands) + ' хиляд' + (thousands > 1 ? 'и' : 'а') + ' ';
    integer %= 1000;
  }
  
  if (integer > 0) {
    result += convertGroup(integer);
  }
  
  result = result.trim();
  
  if (decimal > 0) {
    result += ' и ' + convertGroup(decimal) + ' сто' + (decimal > 1 ? 'тинки' : 'тинка');
  }
  
  return result || 'нула';
};

// Calcular totales de documento
exports.calculateDocumentTotals = (items) => {
  let subtotal = 0;
  let totalVat = 0;
  const vatBreakdown = {};

  items.forEach(item => {
    const quantity = parseFloat(item.quantity || 0);
    const unitPrice = parseFloat(item.unitPrice || 0);
    const vatRate = parseFloat(item.vatRate || 0);
    
    const itemSubtotal = quantity * unitPrice;
    const itemVat = itemSubtotal * (vatRate / 100);
    
    subtotal += itemSubtotal;
    totalVat += itemVat;
    
    // Agrupar por tasa de IVA
    if (!vatBreakdown[vatRate]) {
      vatBreakdown[vatRate] = { base: 0, vat: 0 };
    }
    vatBreakdown[vatRate].base += itemSubtotal;
    vatBreakdown[vatRate].vat += itemVat;
  });

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    total: Math.round((subtotal + totalVat) * 100) / 100,
    vatBreakdown
  };
};

// Validar número de IVA búlgaro
exports.validateBulgarianVAT = (vatNumber) => {
  if (!vatNumber) return true; // VAT es opcional
  
  // Remover prefijo BG si existe
  const cleanVAT = vatNumber.replace(/^BG/i, '');
  
  // Debe ser exactamente 9 o 10 dígitos
  if (!/^\d{9,10}$/.test(cleanVAT)) {
    return false;
  }
  
  // Si tiene 9 dígitos, debe ser un EIK válido
  if (cleanVAT.length === 9) {
    return this.validateEIK(cleanVAT);
  }
  
  return true; // Para números de 10 dígitos, validación simplificada
};

// Generar hash para archivos
exports.generateFileHash = (filename) => {
  const crypto = require('crypto');
  const timestamp = Date.now();
  return crypto.createHash('md5').update(filename + timestamp).digest('hex');
};

// Limpiar nombre de archivo
exports.sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Obtener extensión de archivo
exports.getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Validar tipos de archivo permitidos
exports.isAllowedFileType = (filename, allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif']) => {
  const extension = this.getFileExtension(filename);
  return allowedTypes.includes(extension);
};

// Formatear tamaño de archivo
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Escapar HTML
exports.escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Generar token aleatorio
exports.generateRandomToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

// Validar email
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Normalizar texto búlgaro para búsqueda
exports.normalizeBulgarianText = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/ъ/g, 'a')
    .replace(/ь/g, 'y')
    .replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    .replace(/ч/g, 'ch')
    .replace(/ш/g, 'sh')
    .replace(/щ/g, 'sht')
    .replace(/ж/g, 'zh')
    .replace(/ц/g, 'ts');
};