// app/login/page.tsx
'use client';

import './login.css';
import { useState } from 'react';
import { signIn } from "next-auth/react";
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      // Store user ID in localStorage
      localStorage.setItem('userId', data.userId);
      window.location.href = '/'; // redirect to home
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Sign In
          </button>
          <a href="/.auth/login/aad" className="login-button">
  SSO
</a>
          {/* <button
            type="button"
            className="login-button"
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
          >
            SSO
          </button> */}
        </form>
      </div>
    </div>
  );
}
