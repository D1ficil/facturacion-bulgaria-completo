const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eik: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  vatNumber: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  bankName: {
    type: DataTypes.STRING
  },
  iban: {
    type: DataTypes.STRING(50)
  },
  bic: {
    type: DataTypes.STRING(20)
  },
  logo: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'companies',
  timestamps: true
});

module.exports = Company;