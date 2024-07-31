// src/routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './componentes/home.jsx';
import Login from './componentes/login.jsx';
import Formulario from './componentes/crearEvento.jsx';
import Asignaturas from './componentes/asignatura.jsx';
import Eventos from './componentes/eventos.jsx';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/asignaturas" element={<Asignaturas />} />
        <Route path="/createEvent" element={<Formulario />} />/mostrarEventos
        <Route path="/mostrarEventos" element={<Eventos />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
