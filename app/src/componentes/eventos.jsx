import React, { useState, useEffect } from 'react';
import Evento from './evento.jsx';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      throw new Error('No se encontró token de autenticación');
    }

    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:3000/readEvents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
            throw new Error('No hay respuesta Ok del servidor');
        }

        const eventos = await response.json();

        const eventos_def = await Promise.all(
          eventos.map(async (evento) => {
            const subjectProfesorResponse = await fetch(`http://localhost:3000/getSubjectAndProfesorById?id=${evento.profesor_asignatura_id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!subjectProfesorResponse.ok) {
              throw new Error('No hay respuesta Ok del servidor');
            }

            const subjectProfesorData = await subjectProfesorResponse.json();

            const profesorResponse = await fetch(`http://localhost:3000/getProfesorById?id=${subjectProfesorData.profesor_id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            const profesorData = await profesorResponse.json();

            const asignaturaResponse = await fetch(`http://localhost:3000/getAsignaturaById?id=${subjectProfesorData.asignatura_codigo}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            const asignaturaData = await asignaturaResponse.json();
            
            return {
              id: evento.id,
              tipo: evento.tipo,
              fecha_hora: evento.fecha_hora,
              profesor: {
                id: profesorData.id,
                nombre: profesorData.nombre
              },
              asignatura: {
                codigo: asignaturaData.codigo,
                nombre: asignaturaData.nombre,
                curso: asignaturaData.curso,
                grado: asignaturaData.grado
              },
              aula: evento.aula_id 
            };

          })
        );
        
        console.log(eventos_def);

        setEventos(eventos_def);
        setLoading(false);

      } catch (error) {
        console.error('Error obteniendo eventos:', error);
        setError('Error obteniendo eventos: ' + error.message);
        setLoading(false);
      }
    };

    fetchEventos();
  }, [navigate]);


  if (loading) {
    return <p>Cargando eventos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Navbar />
      <h1>Todos los Eventos</h1>
      {eventos.map((evento) => (
        <Evento 
            key={evento.id} 
            evento={evento} 
            eventos={eventos}
            setEventos={setEventos} 
        />
      ))}
    </div>
  );
};

export default Eventos;
