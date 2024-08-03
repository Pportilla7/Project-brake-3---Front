import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginCss from '../css/login.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Login exitoso');
        navigate('/home');
      } else {
        setError(data.message || 'Error en el login');
      }
    } catch (err) {
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="formContainer">
        <h2 className="formTitle">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="formLabel">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="formInput"
              disabled={loading}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="formInput"
              disabled={loading}
            />
          </div>
          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="formButton" disabled={loading}>
            {loading ? 'Cargando...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
