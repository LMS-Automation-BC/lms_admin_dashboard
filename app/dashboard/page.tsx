import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  console.log('Dashboard session', session);
  if (!session) {
    redirect('/login');
  }

  return <h1>Protected Dashboard</h1>;
} 
