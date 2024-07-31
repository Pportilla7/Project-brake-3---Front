import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setError('No hay token encontrado');
        navigate('/login');
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
    <div>
      <h1>Seleccione una Asignatura</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Código</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Nombre</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Curso</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Grado</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.codigo} onClick={() => handleSubjectClick(subject)} style={{ cursor: 'pointer' }}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{subject.codigo}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{subject.nombre}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{subject.curso}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{subject.grado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectSubject;
