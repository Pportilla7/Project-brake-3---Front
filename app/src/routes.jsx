import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './componentes/home.jsx';
import Login from './componentes/login.jsx';
import Formulario from './componentes/crearEvento.jsx';
import Asignaturas from './componentes/asignatura.jsx';
import Eventos from './componentes/eventos.jsx';
import FormularioAct from './componentes/actualizaEvento.jsx';
import CerrarSesion from './componentes/logout.jsx';
import "./css/base.css";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/asignaturas" element={<Asignaturas />} />
        <Route path="/createEvent" element={<Formulario />} />
        <Route path="/mostrarEventos" element={<Eventos />} />
        <Route path="/actualizaEvento" element={<FormularioAct />} />
        <Route path="/logout" element={<CerrarSesion />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
