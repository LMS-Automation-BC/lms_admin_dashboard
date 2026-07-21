'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './UserGreeting.module.css';

export default function UserGreeting() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getUserInfo = async () => {
    const response = await fetch('/.auth/me');
    const payload = await response.json();
    const { clientPrincipal } = payload;

    if (!clientPrincipal) return null;

    return {
      name: clientPrincipal.userDetails?.split('@')[0] || 'User',
      email: clientPrincipal.userDetails || '',
    };
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = (text: string) =>
    text
      .split(/[.\s_-]/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={styles.avatarBtn}
        onClick={() => setOpen(!open)}
      >
        {getInitials(user.name)}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.profileTop}>
            <div className={styles.avatarLarge}>
              {getInitials(user.name)}
            </div>
            <div>
              <p className={styles.name}>{user.name}</p>
              <p className={styles.email}>{user.email}</p>
            </div>
          </div>

          <a
            href="/.auth/logout?post_logout_redirect_uri=/"
            className={styles.logoutBtn}
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
}