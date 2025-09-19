const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('invoice', 'quote', 'delivery', 'proforma'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  documentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'BGN'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  vatAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft'
  },
  language: {
    type: DataTypes.ENUM('bg', 'es', 'en'),
    defaultValue: 'bg'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;