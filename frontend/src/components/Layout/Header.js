import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { 
  Bars3Icon, 
  BellIcon, 
  ChevronDownIcon, 
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [notifications] = useState([]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          {/* Quick actions */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
            <Menu as="div" className="relative">
              <Menu.Button className="btn btn-primary flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('common.create')}
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </Menu.Button>
              <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/documents/create/invoice"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      {t('documents.createInvoice')}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/documents/create/quote"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      {t('documents.createQuote')}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/documents/create/delivery"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      {t('documents.createDelivery')}
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language selector */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
              <span className="mr-2">{currentLanguage.flag}</span>
              <span className="hidden sm:block">{currentLanguage.name}</span>
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {languages.map((language) => (
                <Menu.Item key={language.code}>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage(language.code)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                        active ? 'bg-gray-100' : ''
                      } ${i18n.language === language.code ? 'text-primary-600 font-medium' : ''}`}
                    >
                      <span className="mr-3">{language.flag}</span>
                      {language.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
              <BellIcon className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">{t('common.notifications')}</h3>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <Menu.Item key={index}>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </Menu.Item>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  {t('common.noNotifications')}
                </div>
              )}
            </Menu.Items>
          </Menu>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden sm:block font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/settings"
                    className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                  >
                    <UserIcon className="w-4 h-4 mr-3" />
                    {t('common.profile')}
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/settings"
                    className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                  >
                    <CogIcon className="w-4 h-4 mr-3" />
                    {t('common.settings')}
                  </a>
                )}
              </Menu.Item>
              <div className="border-t border-gray-200 my-1"></div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`w-full text-left flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    {t('common.logout')}
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;