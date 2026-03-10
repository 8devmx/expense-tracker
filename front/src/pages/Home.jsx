// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Bienvenido a la aplicación de control de gastos</h1>
      <p>
        <Link to="/login">Inicia sesión</Link> para comenzar a gestionar tus finanzas.
      </p>
    </div>
  );
};

export default Home;
