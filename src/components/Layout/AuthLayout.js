import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-primary-600 rounded-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            FacturaBG
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Система за фактуриране за България
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;