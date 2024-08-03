import {jwtDecode} from 'jwt-decode';
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {

  const token = localStorage.getItem('token'); 
  let userId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; 
      console.log('esto es en el navbar', userId);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  return (
    <nav>
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        <li><Link to="/asignaturas">Crear Evento</Link></li>
        <li><Link to="/mostrarEventos">Mostrar Eventos</Link></li>
        <Link to={{pathname:"/mostrarEventos", search: `?userId=${userId}`}}>
            Mis Eventos
          </Link>
        <li><Link to="/logout">Cerrar sesion</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
