const User = require('./User');
const Company = require('./Company');
const Client = require('./Client');
const Product = require('./Product');
const Document = require('./Document');
const DocumentItem = require('./DocumentItem');
const Expense = require('./Expense');
const PaymentMethod = require('./PaymentMethod');
const BankAccount = require('./BankAccount');

// Definir asociaciones
User.hasOne(Company, { foreignKey: 'userId', as: 'company' });
Company.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Company.hasMany(Client, { foreignKey: 'companyId', as: 'clients' });
Client.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Product, { foreignKey: 'companyId', as: 'products' });
Product.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Document, { foreignKey: 'companyId', as: 'documents' });
Document.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Client.hasMany(Document, { foreignKey: 'clientId', as: 'documents' });
Document.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Document.hasMany(DocumentItem, { foreignKey: 'documentId', as: 'items' });
DocumentItem.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

Product.hasMany(DocumentItem, { foreignKey: 'productId', as: 'documentItems' });
DocumentItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Company.hasMany(Expense, { foreignKey: 'companyId', as: 'expenses' });
Expense.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Client.hasMany(Expense, { foreignKey: 'supplierId', as: 'expensesAsSupplier' });
Expense.belongsTo(Client, { foreignKey: 'supplierId', as: 'supplier' });

Company.hasMany(PaymentMethod, { foreignKey: 'companyId', as: 'paymentMethods' });
PaymentMethod.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(BankAccount, { foreignKey: 'companyId', as: 'bankAccounts' });
BankAccount.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

module.exports = {
  User,
  Company,
  Client,
  Product,
  Document,
  DocumentItem,
  Expense,
  PaymentMethod,
  BankAccount
};