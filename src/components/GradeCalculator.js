import React, { useState } from 'react';
import './GradeCalculator.css';

function GradeCalculator() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      weight: '',
      exams: [{ id: 1, grade: '', subWeight: '' }],
    },
  ]);
  const [average, setAverage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const addGroup = () => {
    const newId = groups.length ? groups[groups.length - 1].id + 1 : 1;
    setGroups([
      ...groups,
      { id: newId, weight: '', exams: [{ id: 1, grade: '', subWeight: '' }] },
    ]);
  };

  const removeGroup = (groupId) => {
    if (groups.length > 1) {
      setGroups(groups.filter((group) => group.id !== groupId));
      setAverage(null);
      setError('');
      setSuccessMessage('');
    }
  };

  const addExam = (groupId) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              exams: [
                ...group.exams,
                {
                  id: group.exams.length
                    ? group.exams[group.exams.length - 1].id + 1
                    : 1,
                  grade: '',
                  subWeight: '',
                },
              ],
            }
          : group
      )
    );
  };

  const removeExam = (groupId, examId) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId && group.exams.length > 1
          ? {
              ...group,
              exams: group.exams.filter((exam) => exam.id !== examId),
            }
          : group
      )
    );
  };

  const updateGroup = (groupId, field, value) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group
      )
    );
  };

  const updateExam = (groupId, examId, field, value) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              exams: group.exams.map((exam) =>
                exam.id === examId ? { ...exam, [field]: value } : exam
              ),
            }
          : group
      )
    );
  };

  const sendGradesToBackend = async (groupsData) => {
    try {
      const response = await fetch('http://localhost:5000/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groups: groupsData }),
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

    // Validar grupos y exámenes
    const groupWeights = groups.map((group) => parseFloat(group.weight) || 0);
    const totalWeight = groupWeights.reduce((sum, weight) => sum + weight, 0);

    // Validar porcentajes globales
    if (totalWeight > 100) {
      setError(
        'La suma de los porcentajes de los grupos no debe superar el 100%.'
      );
      setAverage(null);
      setSuccessMessage('');
      return;
    }

    if (totalWeight === 0) {
      setError(
        'Ingrese al menos un porcentaje mayor a 0 en un grupo para calcular el promedio.'
      );
      setAverage(null);
      setSuccessMessage('');
      return;
    }

    // Validar cada grupo
    for (const group of groups) {
      const groupWeight = parseFloat(group.weight) || 0;
      const subWeights = group.exams.map((exam) => parseFloat(exam.subWeight) || 0);
      const subWeightSum = subWeights.reduce((sum, weight) => sum + weight, 0);

      // Validar porcentaje del grupo
      if (isNaN(groupWeight) || groupWeight < 0 || group.weight === '') {
        setError(
          `El porcentaje del grupo ${group.id} debe ser un número mayor o igual a 0.`
        );
        setAverage(null);
        setSuccessMessage('');
        return;
      }

      // Validar subporcentajes
      if (subWeightSum > 100) {
        setError(
          `La suma de los subporcentajes en el grupo ${group.id} no debe superar el 100%.`
        );
        setAverage(null);
        setSuccessMessage('');
        return;
      }

      if (subWeightSum === 0) {
        setError(
          `Ingrese al menos un subporcentaje mayor a 0 en el grupo ${group.id}.`
        );
        setAverage(null);
        setSuccessMessage('');
        return;
      }

      // Validar notas
      const grades = group.exams.map((exam) => parseFloat(exam.grade));
      const invalidGrades = grades.some(
        (grade, i) =>
          isNaN(grade) || grade < 0 || grade > 5 || group.exams[i].grade === ''
      );
      if (invalidGrades) {
        setError(
          `Todas las notas en el grupo ${group.id} deben ser números entre 0 y 5.`
        );
        setAverage(null);
        setSuccessMessage('');
        return;
      }
    }

    // Calcular promedio ponderado
    let weightedSum = 0;
    for (const group of groups) {
      const groupWeight = parseFloat(group.weight);
      const subWeights = group.exams.map((exam) => parseFloat(exam.subWeight) || 0);
      const subWeightSum = subWeights.reduce((sum, weight) => sum + weight, 0);
      if (subWeightSum === 0) continue; // Evitar división por cero
      for (const exam of group.exams) {
        const grade = parseFloat(exam.grade);
        const subWeight = parseFloat(exam.subWeight);
        weightedSum += grade * (subWeight / subWeightSum) * (groupWeight / 100);
      }
    }
    const calculatedAverage = weightedSum;
    setAverage(calculatedAverage);
    setError('');

    // Enviar al backend
    sendGradesToBackend(groups);
    setSuccessMessage('Promedio calculado correctamente');
  };

  // Calcular suma de porcentajes globales y subporcentajes para la UI
  const totalWeight = groups
    .map((group) => parseFloat(group.weight) || 0)
    .reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="grade-calculator">
      <h2>Calculadora de Notas</h2>
      <form onSubmit={handleSubmit}>
        {groups.map((group) => {
          const subWeightSum = group.exams
            .map((exam) => parseFloat(exam.subWeight) || 0)
            .reduce((sum, weight) => sum + weight, 0);
          return (
            <div key={group.id} className="group">
              <div className="group-header">
                <div className="input-group">
                  <label>Porcentaje del Grupo (%):</label>
                  <input
                    type="number"
                    value={group.weight}
                    onChange={(e) => updateGroup(group.id, 'weight', e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0-100"
                  />
                </div>
                {groups.length > 1 && (
                  <button
                    type="button"
                    className="remove-group-btn"
                    onClick={() => removeGroup(group.id)}
                  >
                    Eliminar Grupo
                  </button>
                )}
              </div>
              <p className="sub-weight-sum">
                Suma de subporcentajes: {subWeightSum.toFixed(1)}%
              </p>
              <div className="exams">
                {group.exams.map((exam) => (
                  <div key={exam.id} className="exam-row">
                    <div className="input-group">
                      <label>Nota:</label>
                      <input
                        type="number"
                        value={exam.grade}
                        onChange={(e) =>
                          updateExam(group.id, exam.id, 'grade', e.target.value)
                        }
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0-5"
                      />
                    </div>
                    <div className="input-group">
                      <label>Subporcentaje (% del grupo):</label>
                      <input
                        type="number"
                        value={exam.subWeight}
                        onChange={(e) =>
                          updateExam(group.id, exam.id, 'subWeight', e.target.value)
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0-100"
                      />
                    </div>
                    {group.exams.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeExam(group.id, exam.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-exam-btn"
                  onClick={() => addExam(group.id)}
                >
                  Añadir Examen al Grupo
                </button>
              </div>
            </div>
          );
        })}
        <button type="button" className="add-group-btn" onClick={addGroup}>
          Añadir Grupo
        </button>
        <button type="submit" className="calculate-btn">
          Calcular Promedio
        </button>
      </form>
      <p className="weight-sum">
        Suma de porcentajes de grupos: {totalWeight.toFixed(1)}%
      </p>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      {average !== null && <p>Promedio: {average.toFixed(2)}</p>}
    </div>
  );
}

export default GradeCalculator;