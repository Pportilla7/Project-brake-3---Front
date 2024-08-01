// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        <li><Link to="/asignaturas">Crear Evento</Link></li>
        <li><Link to="/mostrarEventos">Visualizar Eventos</Link></li>
        <li><Link to="/actualizarEventos">Actualizar Evento</Link></li>
        <li><Link to="/eliminarEventos">Eliminar Evento</Link></li>
        <li><Link to="/logout">Cerrar sesion</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
