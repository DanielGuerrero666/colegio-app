import React, { useState } from 'react';
import './GradeCalculator.css';

function GradeCalculator() {
  return (
    <div className="grade-calculator">
      <h2>Calculadora de Notas</h2>
      <form>
        <div>
          <label>Primer Examen (30%):</label>
          <input type="number" />
        </div>
        <div>
          <label>Segundo Examen (40%):</label>
          <input type="number" />
        </div>
        <div>
          <label>Examen Final (30%):</label>
          <input type="number" />
        </div>
        <button type="submit">Calcular Promedio</button>
      </form>
    </div>
  );
}

export default GradeCalculator;