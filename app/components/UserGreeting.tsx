'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function UserGreeting() {
  const { data: session } = useSession();
  const userId =
    session?.user?.email || session?.user?.name || session?.user?.id || null;

  if (!userId) return null;

  return (
    <p style={{ fontSize: '16px', color: '#555' }}>
      Logged in as: <strong>{userId}</strong>
    </p>
  );
}
