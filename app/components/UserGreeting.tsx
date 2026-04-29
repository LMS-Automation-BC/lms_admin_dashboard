'use client';

import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';

export default function UserGreeting() {
  // const { data: session } = useSession();
  // const userId =
  //   session?.user?.email || session?.user?.name || null;

  const getUserInfo = async () => {
  const response = await fetch('/.auth/me');
  const payload = await response.json();
  const { clientPrincipal } = payload;
  
  // The 'userDetails' property typically contains the username or email
  return clientPrincipal ? clientPrincipal.userDetails : null;
}

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      setUserId(userInfo);
    };

    fetchUserInfo();
  }, []);

  if (!userId) return null;

  return (
    <p style={{ fontSize: '16px', color: '#555' }}>
      Logged in as: <strong>{userId}</strong>
    </p>
  );
}
