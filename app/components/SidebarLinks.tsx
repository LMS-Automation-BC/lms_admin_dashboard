'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CSSProperties } from 'react';
import { FiCalendar, FiAward, FiHome, FiFolder } from 'react-icons/fi';

interface Props {
  isLoggedIn: boolean;
}

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  isNew?:boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Organization', path: '/organization', icon: FiHome },
  { name: 'Programs & Courses', path: '/programs', icon: FiFolder },
  { name: 'Attendance Processor', path: '/attendance', icon: FiCalendar },
  { name: 'Grades to Transcripts', path: '/grades', icon: FiAward },
  { name: 'Organization*', path: '/dborganization', icon: FiHome , isNew:true },
  { name: 'Programs & Courses*', path: '/dbprograms', icon: FiFolder, isNew:true },
  { name: 'Attendance*', path: '/dbattendance', icon: FiCalendar, isNew:true },
  { name: 'Students*', path: '/students', icon: FiAward, isNew:true },
  
];

const SidebarLinks = ({ isLoggedIn }: Props) => {
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
        <div className="header">
          <img
            src="/brookes_college.png"
            alt="Institution Logo"
            className="logo"
          />
          <div className="vertical-line" />
          <div className="institution-name-wrapper">
            <div className="institution-name brookes">Brookes</div>
            <div className="institution-name college">College</div>
          </div>
        </div>
        LMS Data Processor
      </h2>

   {menuItems.map(({ name, path, icon: Icon, isNew }) => {
     const baseStyle = pathname === path ? activeItemStyle : itemStyle;
  const newItemStyle = isNew
    ? { ...baseStyle, backgroundColor: "#72e372ff" } // light green highlight
    : baseStyle;
    return (
    
  <Link
    key={path}
    href={path}
     onClick={(e) => {
    e.preventDefault();
    window.location.href = path;
  }}
   style={newItemStyle}
  >
    <Icon size={18} />
    {name}
  </Link>
)})}

      {isLoggedIn && (
        <form action="/api/logout" method="POST" style={{ marginTop: '20px' }}>
          <button type="submit" className="logout-button">
            Logout
          </button>
        </form>
      )}
    </nav>
  );
};

export default SidebarLinks;
