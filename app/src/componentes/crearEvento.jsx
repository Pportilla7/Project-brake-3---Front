import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Navbar from './navbar';

const CrearEvento = () => {
  const [aulas, setAulas] = useState([]);
  const [error, setError] = useState(null);
  const [tipo, setTipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const navigate = useNavigate();
  const selectedSubject = JSON.parse(localStorage.getItem('Asignatura seleccionada'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      throw new Error('No se encontró token de autenticación');
    }

    const fetchAulas = async () => {
      try {
        const response = await fetch('http://localhost:3000/getRooms', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No hay respuesta OK del servidor');
        }
        const data = await response.json();
        console.log(data);
        setAulas(data);
        setLoading(false);
      } catch (error) {
        setError('Error obteniendo aulas: ' + error.message);
        setLoading(false);
      }
    };
    fetchAulas();
  }, []);

  const checkAulaDisponibilidad = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
        const response = await fetch(`http://localhost:3000/filterEvents/${dia}?hora=${hora}&aula=${aulaSeleccionada}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.esOcupada) {
        setError('El aula no está disponible en la fecha y hora seleccionadas.');
      } else {
        console.log('Aula libre');
        handleCreateEvent();
      }
    } catch (error) {
      setError('Error verificando disponibilidad del aula: ' + error.message);
    }
  };

  const handleCreateEvent = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
    const userId = decodedToken.id;
    console.log(userId, selectedSubject.codigo);

    try {
      const response = await fetch(`http://localhost:3000/getProfAsigId?profesor_id=${userId}&asignatura_codigo=${selectedSubject.codigo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No hay respuesta OK del servidor');
      }

      const data = await response.json();
      const profesorAsignaturaId=data[0];
      console.log(data[0]);

      const createResponse = await fetch('http://localhost:3000/addEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            tipo: tipo, 
            profesor_asignatura_id: profesorAsignaturaId,
            aula_id: aulaSeleccionada,
            fecha_hora: `${dia} ${hora}:00`,
          }),
      });

      if (!createResponse.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Evento creado con éxito');
      navigate('/mostrarEventos');
    } catch (error) {
      setError('Error creando el evento: ' + error.message);
    }
  };

  if (!selectedSubject) {
    return <p>No se ha seleccionado ninguna asignatura.</p>;
  }

  if (loading) {
    return <p>Cargando aulas...</p>;
  }

  return (
    <div>
      <Navbar />
      <h1>Crear Evento para {selectedSubject.nombre}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p><strong>Código:</strong> {selectedSubject.codigo}</p>
      <p><strong>Curso:</strong> {selectedSubject.curso}</p>
      <p><strong>Grado:</strong> {selectedSubject.grado}</p>

      <form onSubmit={(e) => {
        e.preventDefault();
        checkAulaDisponibilidad();
      }}>
        <div>
          <label>
            Aula:
            <select value={aulaSeleccionada} onChange={(e) => setAulaSeleccionada(e.target.value)} required>
              <option value="">Seleccione un aula</option>
              {aulas.map((aula) => (
                <option key={aula} value={aula}>{aula}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Día:
            <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Hora:
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Tipo:
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              <option value="">Seleccione un tipo</option>
              <option value="clase">Clase</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="examen">Examen</option>
            </select>
          </label>
        </div>
        <button type="submit">Crear Evento</button>
      </form>
    </div>
  );
};

export default CrearEvento;
