const { Product } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, active } = req.query;
    
    const whereClause = { companyId: req.companyId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      products: products.rows,
      totalCount: products.count,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      price,
      vatRate,
      unit
    } = req.body;

    // Verificar si el código ya existe (si se proporciona)
    if (code) {
      const existingProduct = await Product.findOne({
        where: { 
          code, 
          companyId: req.companyId 
        }
      });

      if (existingProduct) {
        return res.status(400).json({ error: 'Ya existe un producto con este código' });
      }
    }

    const product = await Product.create({
      companyId: req.companyId,
      code,
      name,
      description,
      price: parseFloat(price) || 0,
      vatRate: parseFloat(vatRate) || 20,
      unit: unit || 'бр.'
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const {
      code,
      name,
      description,
      price,
      vatRate,
      unit,
      isActive
    } = req.body;

    // Verificar código único (excluyendo el producto actual)
    if (code && code !== product.code) {
      const existingProduct = await Product.findOne({
        where: { 
          code, 
          companyId: req.companyId,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingProduct) {
        return res.status(400).json({ error: 'Ya existe un producto con este código' });
      }
    }

    await Product.update({
      code,
      name,
      description,
      price: parseFloat(price) || 0,
      vatRate: parseFloat(vatRate) || 20,
      unit: unit || 'бр.',
      isActive
    }, {
      where: { id: req.params.id }
    });

    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si el producto está siendo usado en documentos
    const { DocumentItem } = require('../models');
    const documentsCount = await DocumentItem.count({
      where: { productId: req.params.id }
    });

    if (documentsCount > 0) {
      // No eliminar, solo desactivar
      await Product.update(
        { isActive: false },
        { where: { id: req.params.id } }
      );
      return res.json({ message: 'Producto desactivado (está siendo usado en documentos)' });
    }

    await Product.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productos activos (para selects)
exports.getActiveProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        companyId: req.companyId,
        isActive: true 
      },
      attributes: ['id', 'name', 'code', 'price', 'vatRate', 'unit'],
      order: [['name', 'ASC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};