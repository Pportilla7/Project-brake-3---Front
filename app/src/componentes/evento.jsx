import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../css/evento.css'; 

const Evento = ({evento, eventos, setEventos}) => {
    const [esUser, setEsUser] = useState(false);
    const navigate = useNavigate();
    let decodedTokenId=null;

    useEffect(()=>{
        const token = localStorage.getItem('token');
    
        if (!token) {
            navigate('/login');
            throw new Error('No se encontró token de autenticación');
        }

        const decodedToken=jwtDecode(token);
        decodedTokenId=decodedToken.id;

        if(evento.profesor.id === decodedTokenId){
            setEsUser(true);
        }

    }, [evento.profesor.id, navigate]);

    const handleActualizar = () => {
        console.log(evento);
        navigate(`/actualizaEvento`, {state:{evento}});
    };
    
    const handleBorrar = async () => {

        const token = localStorage.getItem('token');
    
        try {
          const response = await fetch(`http://localhost:3000/deleteEvent/${evento.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
    
          if (!response.ok) {
            throw new Error('Fallo al borrar un evento');
          }
          console.log('Evento eliminado con éxito');
          const nuevoEventos=eventos.filter(e=>e.id!==evento.id);
          setEventos(nuevoEventos);
          alert('Evento borrado con exito');
        } 
        catch (error) {
          console.error('Error eliminando el evento:', error);
        }
    };
    

  return (
    <div className="evento-container">
      <h3 className="evento-tipo">{evento.tipo}</h3>

      <div className="evento-detalles">
        <div className="evento-profesor">
          <h4>Profesor</h4>
          <p><strong>ID:</strong> {evento.profesor.id}</p>
          <p><strong>Nombre:</strong> {evento.profesor.nombre}</p>
        </div>

        <div className="evento-asignatura">
          <h4>Asignatura</h4>
          <p><strong>Código:</strong> {evento.asignatura.codigo}</p>
          <p><strong>Nombre:</strong> {evento.asignatura.nombre}</p>
          <p><strong>Curso:</strong> {evento.asignatura.curso}</p>
          <p><strong>Grado:</strong> {evento.asignatura.grado}</p>
        </div>

        <div className="evento-aula">
          <h4>Aula</h4>
          <p><strong>ID Aula:</strong> {evento.aula}</p>
        </div>

        <div className="evento-fecha-hora">
          <h4>Fecha y Hora</h4>
          <p>{new Date(evento.fecha_hora).toLocaleString()}</p>
        </div>
      </div>

      {esUser && (
        <div className="evento-botones">
          <button className="btn-actualizar" onClick={handleActualizar}>Actualizar</button>
          <button className="btn-borrar" onClick={handleBorrar}>Borrar</button>
        </div>
      )}
    </div>
  );
};

export default Evento;
