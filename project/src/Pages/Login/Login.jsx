import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate('/maps');
        } else {
          alert(data.message);
        }
      });
  }

  return (
    <div className={styles.loginWrapper}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <NavLink to="/register">Register</NavLink>
      </p>
    </div>
  );
};

export default Login;
