

import React from 'react';
import Sidebar from './components/Sidebar';
import './globals.css'; // Create this if you want basic styles

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
