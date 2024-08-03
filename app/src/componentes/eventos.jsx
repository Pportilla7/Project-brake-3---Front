import React, { useState, useEffect } from 'react';
import Evento from './evento.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './navbar';
import '../css/eventos.css'

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); 

  const params = new URLSearchParams(location.search);
  console.log(params);
  const user = params.get('userId');
  console.log('esto es el userId',user);

  const procesarEventos = async (eventos, token)=>{
    console.log('dentro de processar eventops',eventos)
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
            nombre: profesorData.nombre,
          },
          asignatura: {
            codigo: asignaturaData.codigo,
            nombre: asignaturaData.nombre,
            curso: asignaturaData.curso,
            grado: asignaturaData.grado,
          },
          aula: evento.aula_id,
        };
      })
    );
    console.log('esto son los eventos definitivo',eventos_def);
    return eventos_def;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');

    
    if (!token) {
      navigate('/login');
      throw new Error('No se encontró token de autenticación');
    }

    const fetchEventosByUser = async () => {
      if (!user) return;
    
      try {
        const profAsignIdResponse = await fetch(`http://localhost:3000/getProfAsigId?profesor_id=${user}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!profAsignIdResponse.ok) {
          throw new Error('Error al obtener eventos por usuario');
        }
    
        const profAsignIdData = await profAsignIdResponse.json();
        console.log('Esto son los prof_asig_id por profesor:', profAsignIdData);
    
        if (Array.isArray(profAsignIdData)) {
          console.log('profAsignIdData es un array.');
          
          const eventosResponses = await Promise.all(
            profAsignIdData.map(async (profesorAsignaturaId) => {
              const response = await fetch(`http://localhost:3000/readEvents?profesorAsignaturaId=${profesorAsignaturaId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
    
              if (!response.ok) {
                throw new Error('Error fetching events for profesorAsignaturaId: ' + profesorAsignaturaId);
              }
    
              return response.json();
            })
          );
    
          console.log('Eventos obtenidos:', eventosResponses);
         
          const eventosData = await procesarEventos(eventosResponses.flat(), token);
          console.log('Todos los eventos combinados:', eventosData);
          setEventos(eventosData);
          setLoading(false);
        } else {
          console.error('profAsignIdData no es un array:', profAsignIdData);
        }
      } catch (error) {
        console.error('No se han obtenido los eventos por usuario:', error);
        setError('No se han obtenido los eventos por usuario: ' + error.message);
      }
    };
    
  
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
  
        const eventosResponses = await response.json();
  
        const eventosData = await procesarEventos(eventosResponses.flat(), token);
  
        console.log(eventosData);
  
        setEventos(eventosData);
        setLoading(false);
  
      } catch (error) {
        console.error('Error obteniendo eventos:', error);
        setError('Error obteniendo eventos: ' + error.message);
        setLoading(false);
      }
    };
  
    if (user) {
      fetchEventosByUser();
    } else {
      fetchEventos();
    }
  }, [navigate, user]);

  if (loading) {
    return <p>Cargando eventos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container-principal">
    <Navbar />
    <div className="container">
      <h1 className="title">Todos los Eventos</h1>
      <div className="event-list">
        {eventos.map((evento) => (
          <Evento 
              key={evento.id} 
              evento={evento} 
              eventos={eventos}
              setEventos={setEventos}
          />
        ))}
      </div>
    </div>
  </div>

  );
};

export default Eventos;
