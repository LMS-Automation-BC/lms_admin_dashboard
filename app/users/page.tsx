'use client';

import { useEffect, useState } from 'react';
import styles from './Admin.module.css';

type Permission = {
  page: string;
  can_read: boolean;
  can_edit: boolean;
};

type Admin = {
  id: string;
  email: string;
  permissions: Permission[];
};

const ALL_PAGES = ['attendance', 'dashboard', 'reports', 'settings'];

export default function AdminPermissions() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState('');

  const fetchAdmins = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/users`);
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addAdmin = async () => {
    if (!email) return;

    await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pages: ALL_PAGES }),
    });

    setEmail('');
    fetchAdmins();
  };

  const togglePermission = async (
    adminId: string,
    page: string,
    perm: Permission,
    type: 'read' | 'edit'
  ) => {
    const newRead = type === 'read' ? !perm.can_read : perm.can_read;
    const newEdit = type === 'edit' ? !perm.can_edit : perm.can_edit;

    await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_APP_URL}/api/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId,
        page,
        canRead: newRead,
        canEdit: newEdit,
      }),
    });

    fetchAdmins();
  };

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.title}>Admin Access</h1>

      <div className={styles.inputGroup}>
        <input
          type="email"
          placeholder="Add admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button onClick={addAdmin} className={styles.button}>
          Add
        </button>
      </div>

      {admins.map((admin) => (
        <div key={admin.id} className={styles.card}>
          <div className={styles.email}>{admin.email}</div>

          {admin.permissions.map((perm) => (
            <div key={perm.page} className={styles.permissionRow}>
              <div className={styles.pageName}>{perm.page}</div>

              <div className={styles.toggles}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={perm.can_read}
                    onChange={() =>
                      togglePermission(admin.id, perm.page, perm, 'read')
                    }
                  />
                  Read
                </label>

                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={perm.can_edit}
                    onChange={() =>
                      togglePermission(admin.id, perm.page, perm, 'edit')
                    }
                  />
                  Edit
                </label>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}