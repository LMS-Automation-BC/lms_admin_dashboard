"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CSSProperties } from 'react';
import { FiActivity } from 'react-icons/fi'; // Feather icon
import { IconType } from 'react-icons';

interface MenuItem {
  name: string;
  path: string;
  icon: IconType;
}

const menuItems: MenuItem[] = [
  {
    name: 'Attendance Processor',
    path: '/attendance',
    icon: FiActivity,
  },
  {
    name: 'Grade Transcript Generator',
    path: '/grades',
    icon: FiActivity,
  }
  // You can add more menu items like this:
  // { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
];

const Sidebar = () => {
  const pathname = usePathname();

  const containerStyle: CSSProperties = {
    width: '220px',
    background: '#f8f9fa',
    padding: '20px',
    borderRight: '1px solid #ddd',
    height: '100vh',
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#333',
    marginBottom: '8px',
    fontWeight: 500,
    transition: 'background 0.2s, color 0.2s',
  };

  const activeItemStyle: CSSProperties = {
    ...itemStyle,
    backgroundColor: '#0070f3',
    color: '#fff',
  };

  return (
    <nav style={containerStyle}>
      <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#444' }}>
        🧭 Navigation
      </h2>

      {menuItems.map(({ name, path, icon: Icon }) => (
        <Link
          key={path}
          href={path}
          style={pathname === path ? activeItemStyle : itemStyle}
        >
          <Icon size={18} />
          {name}
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar;
