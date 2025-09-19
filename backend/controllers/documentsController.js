const { Document, DocumentItem, Client, Product, Company } = require('../models');
const { generateDocumentNumber } = require('../utils/helpers');
const { generatePDF } = require('../utils/pdfGenerator');

// Obtener todos los documentos
exports.getAllDocuments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const whereClause = { companyId: req.companyId };
    if (type) whereClause.documentType = type;
    if (status) whereClause.status = status;

    const offset = (page - 1) * limit;

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Client, 
          as: 'client',
          attributes: ['id', 'name', 'eik', 'city']
        }
      ],
      order: [['documentDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      documents: documents.rows,
      totalCount: documents.count,
      totalPages: Math.ceil(documents.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener documento por ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      },
      include: [
        { 
          model: Client, 
          as: 'client'
        },
        {
          model: DocumentItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo documento
exports.createDocument = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const {
      clientId,
      documentType,
      documentDate,
      dueDate,
      currency = 'BGN',
      language = 'bg',
      notes,
      items
    } = req.body;

    // Generar número de documento
    const documentNumber = await generateDocumentNumber(req.companyId, documentType);

    // Calcular totales
    let subtotal = 0;
    let vatAmount = 0;
    
    items.forEach(item => {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      const itemVat = itemTotal * (parseFloat(item.vatRate) / 100);
      subtotal += itemTotal;
      vatAmount += itemVat;
    });

    const total = subtotal + vatAmount;

    // Crear documento
    const document = await Document.create({
      companyId: req.companyId,
      clientId,
      documentType,
      documentNumber,
      documentDate,
      dueDate,
      currency,
      language,
      notes,
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2)
    }, { transaction });

    // Crear items
    if (items && items.length > 0) {
      for (const item of items) {
        const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        const itemVat = itemTotal * (parseFloat(item.vatRate) / 100);
        
        await DocumentItem.create({
          documentId: document.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          total: (itemTotal + itemVat).toFixed(2)
        }, { transaction });
      }
    }

    await transaction.commit();

    // Obtener documento completo
    const fullDocument = await Document.findByPk(document.id, {
      include: [
        { model: Client, as: 'client' },
        { model: DocumentItem, as: 'items' }
      ]
    });

    res.status(201).json(fullDocument);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creando documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar documento
exports.updateDocument = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const document = await Document.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const {
      clientId,
      documentDate,
      dueDate,
      currency,
      language,
      notes,
      items
    } = req.body;

    // Calcular nuevos totales
    let subtotal = 0;
    let vatAmount = 0;
    
    if (items) {
      items.forEach(item => {
        const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        const itemVat = itemTotal * (parseFloat(item.vatRate) / 100);
        subtotal += itemTotal;
        vatAmount += itemVat;
      });
    }

    const total = subtotal + vatAmount;

    // Actualizar documento
    await Document.update({
      clientId,
      documentDate,
      dueDate,
      currency,
      language,
      notes,
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2)
    }, { 
      where: { id: req.params.id },
      transaction 
    });

    // Actualizar items
    if (items) {
      // Eliminar items existentes
      await DocumentItem.destroy({
        where: { documentId: req.params.id },
        transaction
      });

      // Crear nuevos items
      for (const item of items) {
        const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        const itemVat = itemTotal * (parseFloat(item.vatRate) / 100);
        
        await DocumentItem.create({
          documentId: req.params.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          total: (itemTotal + itemVat).toFixed(2)
        }, { transaction });
      }
    }

    await transaction.commit();

    // Obtener documento actualizado
    const updatedDocument = await Document.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: DocumentItem, as: 'items' }
      ]
    });

    res.json(updatedDocument);
  } catch (error) {
    await transaction.rollback();
    console.error('Error actualizando documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar documento
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (document.status === 'paid') {
      return res.status(400).json({ error: 'No se puede eliminar un documento pagado' });
    }

    await Document.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Generar PDF
exports.generatePDF = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      },
      include: [
        { model: Client, as: 'client' },
        { model: DocumentItem, as: 'items' },
        { model: Company, as: 'company' }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const pdfBuffer = await generatePDF(document);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${document.documentType}-${document.documentNumber}.pdf`
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
};

// Cambiar estado del documento
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const document = await Document.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    await Document.update(
      { status },
      { where: { id: req.params.id } }
    );

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};