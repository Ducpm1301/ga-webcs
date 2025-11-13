import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, SquareActivity } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const items = [
    { name: 'Homepage', path: '/dashboard', tip: 'Homepage', icon: (
      <House />
    ) },
    { name: 'Theo dõi vận hành', path: '/statistic', tip: 'Theo dõi vận hành', icon: (
      <SquareActivity />
    ) },
  ];

  return (
    <ul className="menu w-full grow shadow">
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={
              `is-drawer-close:tooltip is-drawer-close:tooltip-right ${location.pathname === item.path ? 'active' : ''}`
            }
            data-tip={item.tip}
          >
            {item.icon}
            <span className="is-drawer-close:hidden">{item.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
