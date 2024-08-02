import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Navbar from './navbar';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');      
    }
    
    if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUser(decodedToken); 
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }, []);

  const handleCreateEvent = () => {
    navigate('/asignaturas');
  };

  const handleSearchEvent = () => {
    navigate('/mostrarEventos');
  };

  if (!user) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="home-container">
      <Navbar />
      <h1>Bienvenido, {user.email}</h1> {/* Assuming user object has a name property */}
      <div className="buttons-container">
        <button onClick={handleCreateEvent}>Crear Evento</button>
        <button onClick={handleSearchEvent}>Buscar Evento</button>
      </div>
    </div>
  );
};

export default Home;
