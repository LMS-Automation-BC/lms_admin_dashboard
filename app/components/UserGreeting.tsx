'use client';

import { useEffect, useState } from 'react';
import styles from './UserGreeting.module.css';

export default function UserGreeting() {
  const [userId, setUserId] = useState<string | null>(null);

  const getUserInfo = async () => {
    const response = await fetch('/.auth/me');
    const payload = await response.json();
    const { clientPrincipal } = payload;

    return clientPrincipal ? clientPrincipal.userDetails : null;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      setUserId(userInfo);
    };

    fetchUserInfo();
  }, []);

  if (!userId) return null;

  const getInitials = (text: string) => {
    const parts = text.split('@')[0].split(/[.\s_-]/);
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const initials = getInitials(userId);

  return (
    <div className={styles.userProfile}>
      <div className={styles.avatar}>{initials}</div>
      <span className={styles.userEmail}>{userId}</span>
    </div>
  );
}