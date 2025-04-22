import React from 'react';
import './App.css';
import GradeCalculator from './components/GradeCalculator';
import logo from './assets/Logo.jpeg';

function App() {
  return (
    <div className="App">
      <h1>Bienvenido al Colegio</h1>
      <img src={logo} className="logo" alt="Logo del colegio" />
      <GradeCalculator />
    </div>
  );
}

export default App;