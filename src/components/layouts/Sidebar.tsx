import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Theo dõi vận hành', path: '/statistic', icon: '⚙️' },
  ];

  return (
    <ul className="menu">
        {/* Logo Section */}
        <li className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GA</span>
            </div>
            <span className="font-semibold text-lg">GA System</span>
            </div>
        </li>
        {/* Navigation Menu */}
        {menuItems.map((item) => (
            <li key={item.path}>
                <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                </Link>
            </li>
        ))}
    </ul>
  );
};

export default Sidebar;