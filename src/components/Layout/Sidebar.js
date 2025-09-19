import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  DocumentIcon,
  TruckIcon,
  UsersIcon,
  CubeIcon,
  ReceiptPercentIcon,
  CogIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'documents', 
    icon: DocumentTextIcon, 
    children: [
      { name: 'invoices', href: '/invoices', icon: DocumentIcon },
      { name: 'quotes', href: '/quotes', icon: DocumentIcon },
      { name: 'deliveries', href: '/deliveries', icon: TruckIcon },
    ]
  },
  { name: 'clients', href: '/clients', icon: UsersIcon },
  { name: 'products', href: '/products', icon: CubeIcon },
  { name: 'expenses', href: '/expenses', icon: ReceiptPercentIcon },
  { name: 'reports', href: '/reports', icon: ChartBarIcon },
  { name: 'settings', href: '/settings', icon: CogIcon },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 bg-primary-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-primary-600 font-bold text-lg">F</span>
          </div>
          <h1 className="text-white font-bold text-xl">
            FacturaBG
          </h1>
        </div>
      </div>

      {/* User info */}
      <div className="p-6 bg-primary-600 border-b border-primary-500">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold text-lg">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-primary-200 text-sm">
              {user?.company?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600">
                  <item.icon className="w-5 h-5 mr-3" />
                  {t(`nav.${item.name}`)}
                </div>
                <div className="ml-8 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <child.icon className="w-4 h-4 mr-3" />
                      {t(`nav.${child.name}`)}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {t(`nav.${item.name}`)}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 FacturaBG v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-0 right-0 p-2">
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:shadow-sm lg:border-r lg:border-gray-200 lg:block">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;