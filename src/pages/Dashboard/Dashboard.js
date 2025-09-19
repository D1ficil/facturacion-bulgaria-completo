import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalClients: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulando datos del dashboard
        setTimeout(() => {
          setStats({
            totalInvoices: 156,
            totalRevenue: 45780.50,
            totalClients: 23,
            pendingInvoices: 12,
            monthlyRevenue: 8450.00,
            revenueGrowth: 12.5,
            recentInvoices: [
              { id: 1, number: 'INV-000156', client: 'Acme Corp', amount: 1200.00, status: 'paid' },
              { id: 2, number: 'INV-000155', client: 'Tech Solutions', amount: 850.00, status: 'pending' },
              { id: 3, number: 'INV-000154', client: 'Digital Agency', amount: 2100.00, status: 'sent' },
              { id: 4, number: 'INV-000153', client: 'StartupBG', amount: 650.00, status: 'overdue' },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      name: t('dashboard.createInvoice'),
      href: '/documents/create/invoice',
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      name: t('dashboard.createQuote'),
      href: '/documents/create/quote',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      name: t('dashboard.addClient'),
      href: '/clients?new=true',
      icon: UsersIcon,
      color: 'bg-purple-500'
    }
  ];

  const statCards = [
    {
      name: t('dashboard.totalInvoices'),
      value: stats.totalInvoices,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: t('dashboard.totalRevenue'),
      value: `${stats.totalRevenue.toFixed(2)} лв.`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: t('dashboard.totalClients'),
      value: stats.totalClients,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: t('dashboard.pendingInvoices'),
      value: stats.pendingInvoices,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      paid: 'Платена',
      pending: 'Чакаща',
      sent: 'Изпратена',
      overdue: 'Просрочена'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg">
        <div className="px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome')}, {user?.firstName}!
          </h1>
          <p className="mt-2 text-primary-100">
            {t('dashboard.welcomeMessage')}
          </p>
          <div className="mt-4 flex space-x-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <action.icon className="w-5 h-5 mr-2" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {t('dashboard.recentInvoices')}
              </h3>
              <Link
                to="/invoices"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('common.viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-sm text-gray-500">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.amount.toFixed(2)} лв.
                    </p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {t('dashboard.monthlyPerformance')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.thisMonth')}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.monthlyRevenue.toFixed(2)} лв.
                </span>
              </div>
              
              <div className="flex items-center">
                <div className={`flex items-center ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(stats.revenueGrowth)}%
                  </span>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {t('dashboard.fromLastMonth')}
                </span>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.monthlyRevenue / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 лв.</span>
                  <span>10,000 лв.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('dashboard.quickLinks')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/documents/create/invoice"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('dashboard.newInvoice')}</p>
              <p className="text-sm text-gray-500">{t('dashboard.createNewInvoice')}</p>
            </div>
          </Link>
          
          <Link
            to="/clients"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('dashboard.manageClients')}</p>
              <p className="text-sm text-gray-500">{t('dashboard.viewAllClients')}</p>
            </div>
          </Link>
          
          <Link
            to="/expenses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('dashboard.trackExpenses')}</p>
              <p className="text-sm text-gray-500">{t('dashboard.manageExpenses')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;