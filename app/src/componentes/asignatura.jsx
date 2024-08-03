import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/asignatura.css'

const SelectSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
        const token = localStorage.getItem('token');
    
        if (!token) {
          navigate('/login');
          throw new Error('No se encontró token de autenticación');
        }

      try {
        const response = await fetch('http://localhost:3000/getSubjects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });

        if (!response.ok) {
          throw new Error('No hemos obtenido respuesta OK');
        }

        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        setError('Error solicitando datos al endpoint. Mensaje: ' + error.message);
        console.error('Error solicitando datos al endpoint. Mensaje: ', error);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    console.log('Asignatura seleccionada: ', subject);
    localStorage.setItem('Asignatura seleccionada', JSON.stringify(subject));
    navigate('/createEvent');
  };

  return (
    <div className="container">
      <h1>Seleccione una Asignatura</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Grado</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.codigo} onClick={() => handleSubjectClick(subject)} style={{ cursor: 'pointer' }}>
              <td>{subject.codigo}</td>
              <td>{subject.nombre}</td>
              <td>{subject.curso}</td>
              <td>{subject.grado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectSubject;
