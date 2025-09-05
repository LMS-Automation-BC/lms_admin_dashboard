// app/components/Sidebar.tsx
import { cookies } from 'next/headers';
import SidebarLinks from './SidebarLinks';

const Sidebar = async() => {
  const isLoggedIn = (await cookies()).get('auth')?.value === 'true';

  return (
    <SidebarLinks isLoggedIn={isLoggedIn} />
  );
};

export default Sidebar;
