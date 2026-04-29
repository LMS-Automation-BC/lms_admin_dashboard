

import React from 'react';
import Sidebar from './components/Sidebar';
import UserGreeting from './components/UserGreeting';
import Providers from './providers';
import './globals.css'; // Create this if you want basic styles
import { OrganizationProvider } from './dborganization/OrganizationContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <main style={{ flexGrow: 1, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <UserGreeting />
                <a 
  href="/.auth/logout?post_logout_redirect_uri=/" 
  style={{
    backgroundColor: '#d32f2f',
    color: '#fff',
    borderRadius: '6px',
    padding: '10px 16px',
    textDecoration: 'none',
    display: 'inline-block'
  }}
>
  Logout
</a>

              </div>
              <OrganizationProvider>
                {children}
              </OrganizationProvider>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
