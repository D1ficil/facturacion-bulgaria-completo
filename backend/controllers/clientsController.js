const { Client } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, active } = req.query;
    
    const whereClause = { companyId: req.companyId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { eik: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const offset = (page - 1) * limit;

    const clients = await Client.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      clients: clients.rows,
      totalCount: clients.count,
      totalPages: Math.ceil(clients.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo cliente
exports.createClient = async (req, res) => {
  try {
    const {
      name,
      eik,
      vatNumber,
      address,
      city,
      email,
      phone
    } = req.body;

    // Verificar si el EIK ya existe
    const existingClient = await Client.findOne({
      where: { 
        eik, 
        companyId: req.companyId 
      }
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Ya existe un cliente con este EIK' });
    }

    const client = await Client.create({
      companyId: req.companyId,
      name,
      eik,
      vatNumber,
      address,
      city,
      email,
      phone
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creando cliente:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El EIK debe ser único' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar cliente
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const {
      name,
      eik,
      vatNumber,
      address,
      city,
      email,
      phone,
      isActive
    } = req.body;

    // Verificar EIK único (excluyendo el cliente actual)
    if (eik !== client.eik) {
      const existingClient = await Client.findOne({
        where: { 
          eik, 
          companyId: req.companyId,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingClient) {
        return res.status(400).json({ error: 'Ya existe un cliente con este EIK' });
      }
    }

    await Client.update({
      name,
      eik,
      vatNumber,
      address,
      city,
      email,
      phone,
      isActive
    }, {
      where: { id: req.params.id }
    });

    const updatedClient = await Client.findByPk(req.params.id);
    res.json(updatedClient);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar cliente
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id, 
        companyId: req.companyId 
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si el cliente tiene documentos asociados
    const { Document } = require('../models');
    const documentsCount = await Document.count({
      where: { clientId: req.params.id }
    });

    if (documentsCount > 0) {
      // No eliminar, solo desactivar
      await Client.update(
        { isActive: false },
        { where: { id: req.params.id } }
      );
      return res.json({ message: 'Cliente desactivado (tiene documentos asociados)' });
    }

    await Client.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener clientes activos (para selects)
exports.getActiveClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { 
        companyId: req.companyId,
        isActive: true 
      },
      attributes: ['id', 'name', 'eik', 'city'],
      order: [['name', 'ASC']]
    });

    res.json(clients);
  } catch (error) {
    console.error('Error obteniendo clientes activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};