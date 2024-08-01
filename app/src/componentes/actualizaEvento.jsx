import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './navbar';

const FormularioAct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { evento } = location.state || {};

  // Formatear la fecha para el campo datetime-local
  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
  };

  const [initialData] = useState({
    id: evento.id,
    tipo: evento.tipo,
    fecha_hora: formatDateTime(evento.fecha_hora),
    profesor: {
      id: evento.profesor.id,
      nombre: evento.profesor.nombre
    },
    asignatura: {
      codigo: evento.asignatura.codigo,
      nombre: evento.asignatura.nombre,
      curso: evento.asignatura.curso,
      grado: evento.asignatura.grado
    },
    aula: evento.aula
  });

  // Usar initialData para inicializar formData directamente
  const [formData, setFormData] = useState({ ...initialData });

  const [asignaturas, setAsignaturas] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      throw new Error('No se encontró token de autenticación');
    }

    const fetchAsignaturas = async () => {
      try {
        const token = localStorage.getItem('token');
        
        console.log(evento.profesor.id)
        const subjectResponse = await fetch(`http://localhost:3000/getAsignaturaByProfesorId?id=${evento.profesor.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!subjectResponse.ok) {
            throw new Error('No hay respuesta Ok del servidor');
          }

          const subjectResponseData = await subjectResponse.json();
          console.log(subjectResponseData)
        
        const asignaturas = subjectResponseData.map(async (subject) => {
            const asignaturaResponse = await fetch(`http://localhost:3000/getAsignaturaById?id=${subject}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                },
            });
            return asignaturaResponse.json(); 
        });

        const asignaturasData = await Promise.all(asignaturas);

        console.log(asignaturasData)
        setAsignaturas(asignaturasData);

      } catch (error) {
        console.error('Error fetching subjects:', error);
      } 
    };
    const fetchAulas = async () => {
        try {
          const token = localStorage.getItem('token');
  
          if (!token) {
            throw new Error('No se encontró token de autenticación');
          }
  
          const response = await fetch('http://localhost:3000/getRooms', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Error al obtener las aulas');
          }
  
          const aulasData = await response.json();
          console.log(aulasData);
          setAulas(aulasData);
  
        } catch (error) {
          console.error('Error fetching rooms:', error);
        }
      };

    fetchAulas();
    fetchAsignaturas();
  }, [evento.profesor.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name,value);
    setFormData((prevFormData) => {
      if (name.includes('.')) {
        const [mainKey, subKey] = name.split('.');
        return {
          ...prevFormData,
          [mainKey]: {
            ...prevFormData[mainKey],
            [subKey]: value,
          },
        };
      } else {
        return {
          ...prevFormData,
          [name]: value,
        };
      }
    });
  };

  const handleAsignaturaChange = (e) => {
    const codigoAsignatura = e.target.value;
    const asignaturaSeleccionada = asignaturas.find(asignatura => asignatura.codigo === codigoAsignatura);

    setFormData((prevFormData) => ({
      ...prevFormData,
      asignatura: {
        codigo: asignaturaSeleccionada.codigo,
        nombre: asignaturaSeleccionada.nombre,
        curso: asignaturaSeleccionada.curso,
        grado: asignaturaSeleccionada.grado
      }
    }));
  };

  const checkAulaDisponibilidad = async (dia, hora, token) => {
    console.log(dia, hora, formData.aula);
    
    try {

      const response = await fetch(`http://localhost:3000/filterEvents/${dia}?hora=${hora}&aula=${formData.aula}`, {
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

      console.log(data);

      if (data.esOcupada) {
        setError('El aula no está disponible en la fecha y hora seleccionadas.');
        return true;
      } else {
        console.log('Aula libre');
        return false;
      }
    } catch (error) {
      setError('Error verificando disponibilidad del aula: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    e.preventDefault();

    const [dia, hora] = formData.fecha_hora.split('T');
    console.log(formData.fecha_hora,initialData.fecha_hora)
    console.log(formData.aula,initialData.aula)
    let estaOcupada=false;

    if (formData.fecha_hora !== initialData.fecha_hora || formData.aula !== initialData.aula) {
      console.log('Se ha cambiado la hora');
      estaOcupada = await checkAulaDisponibilidad(dia, hora, token);
    } 

    if(estaOcupada){
        setError('EL aula esta ocupada en la fecha y hora propuesta');
        setFormData(initialData);
        return;
    }

    try{
        const profesorAsiganturaResponse = await fetch(`http://localhost:3000/getProfAsigId?profesor_id=${formData.profesor.id}&asignatura_codigo=${formData.asignatura.codigo}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
    
        if (!profesorAsiganturaResponse.ok) {
        throw new Error('No hay respuesta OK del servidor');
        }
        const profesorAsiganturaData = await profesorAsiganturaResponse.json();
        console.log(initialData.id);

        const updateResponse = await fetch(`http://localhost:3000/actualizarEvent/${initialData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            tipo: formData.tipo, 
            profesor_asignatura_id: profesorAsiganturaData,
            aula_id: formData.aula,
            fecha_hora: `${dia} ${hora}:00`,
            }),
        });

        if (!updateResponse.ok) {
        throw new Error('Network response was not ok');
        }

        console.log('evento actualizado perfectamente');
        alert('Evento actualizado correctamente');
        navigate('/mostrarEventos');
      }
      catch(error){
        setError('Error al actualizar el evento: ' + error.message);
      }
  };

  return (
    <div >
        <Navbar />
        <form onSubmit={handleSubmit}>
        <h2>Actualizar Evento</h2>

        <div>
            <label>Tipo:</label>
            <select
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            >
            <option value="laboratorio">Laboratorio</option>
            <option value="examen">Examen</option>
            <option value="clase">Clase</option>
            </select>
        </div>

        <div>
            <label>Fecha y Hora:</label>
            <input
            type="datetime-local"
            name="fecha_hora"
            value={formData.fecha_hora}
            onChange={handleInputChange}
            />
        </div>

        <div>
            <label>Profesor:</label>
            <input
            type="text"
            name="profesor.nombre"
            value={formData.profesor.nombre}
            disabled
            />
        </div>

        <div>
            <label>Código Asignatura:</label>
            <select
            name="asignatura.codigo"
            value={formData.asignatura.codigo}
            onChange={handleAsignaturaChange}
            >
            {asignaturas.map(asignatura => (
                <option key={asignatura.codigo} value={asignatura.codigo}>
                {asignatura.codigo}
                </option>
            ))}
            </select>
        </div>

        <div>
            <label>Nombre Asignatura:</label>
            <input
            type="text"
            name="asignatura.nombre"
            value={formData.asignatura.nombre}
            disabled
            />
        </div>

        <div>
            <label>Curso:</label>
            <input
            type="text"
            name="asignatura.curso"
            value={formData.asignatura.curso}
            disabled
            />
        </div>

        <div>
            <label>Grado:</label>
            <input
            type="text"
            name="asignatura.grado"
            value={formData.asignatura.grado}
            disabled
            />
        </div>

        <div>
            <label>Aula:</label>
            <select
            name="aula"
            value={formData.aula}
            onChange={handleInputChange}
            >
            {aulas.map((aula) => (
                <option key={aula} value={aula}>
                {aula}
                </option>
            ))}
            </select>
        </div>

        <button type="submit">Actualizar Evento</button>
        {error && <p>{error}</p>}
        </form>
    </div>
    
  );
};

export default FormularioAct;
