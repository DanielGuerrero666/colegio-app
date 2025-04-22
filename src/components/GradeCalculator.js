import React, { useState } from 'react';
import './GradeCalculator.css';

function GradeCalculator() {
  const [exams, setExams] = useState([
    { id: 1, grade: '', weight: '' },
  ]);
  const [average, setAverage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const addExam = () => {
    const newId = exams.length ? exams[exams.length - 1].id + 1 : 1;
    setExams([...exams, { id: newId, grade: '', weight: '' }]);
  };

  const removeExam = (id) => {
    if (exams.length > 1) {
      setExams(exams.filter((exam) => exam.id !== id));
      setAverage(null);
      setError('');
      setSuccessMessage('');
    }
  };

  const updateExam = (id, field, value) => {
    setExams(
      exams.map((exam) =>
        exam.id === id ? { ...exam, [field]: value } : exam
      )
    );
  };

  const sendGradesToBackend = async (examsData) => {
    try {
      const response = await fetch('http://localhost:5000/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exams: examsData }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar las notas al servidor');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Notas enviadas al servidor');
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertir a números y validar
    const grades = exams.map((exam) => parseFloat(exam.grade));
    const weights = exams.map((exam) => parseFloat(exam.weight));

    // Validar notas (0-5 para contexto colombiano)
    const invalidGrades = grades.some(
      (grade, i) =>
        isNaN(grade) || grade < 0 || grade > 5 || exams[i].grade === ''
    );
    if (invalidGrades) {
      setError('Todas las notas deben ser números entre 0 y 5.');
      setAverage(null);
      setSuccessMessage('');
      return;
    }

    // Validar porcentajes
    const invalidWeights = weights.some(
      (weight, i) =>
        isNaN(weight) || weight < 0 || weight > 100 || exams[i].weight === ''
    );
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    if (invalidWeights || weightSum !== 100) {
      setError('Los porcentajes deben ser números entre 0 y 100 y sumar 100%.');
      setAverage(null);
      setSuccessMessage('');
      return;
    }

    // Calcular promedio ponderado
    const calculatedAverage = grades.reduce(
      (sum, grade, i) => sum + grade * (weights[i] / 100),
      0
    );
    setAverage(calculatedAverage);
    setError('');

    // Enviar al backend
    sendGradesToBackend(exams);
    setSuccessMessage('Promedio calculado correctamente');
  };

  return (
    <div className="grade-calculator">
      <h2>Calculadora de Notas</h2>
      <form onSubmit={handleSubmit}>
        {exams.map((exam) => (
          <div key={exam.id} className="exam-row">
            <div className="input-group">
              <label>Nota:</label>
              <input
                type="number"
                value={exam.grade}
                onChange={(e) => updateExam(exam.id, 'grade', e.target.value)}
                min="0"
                max="5"
                step="0.1"
                placeholder="0-5"
              />
            </div>
            <div className="input-group">
              <label>Porcentaje (%):</label>
              <input
                type="number"
                value={exam.weight}
                onChange={(e) => updateExam(exam.id, 'weight', e.target.value)}
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>
            {exams.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeExam(exam.id)}
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addExam}>
          Añadir Examen
        </button>
        <button type="submit" className="calculate-btn">
          Calcular Promedio
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      {average !== null && <p>Promedio: {average.toFixed(2)}</p>}
    </div>
  );
}

export default GradeCalculator;