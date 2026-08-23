import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--chocolate-brown)', fontWeight: 600 }}>Carregando DINO DOCES...</p>
      </div>
    );
  }

  // Se já estiver logado, impedir acesso às telas de login/cadastro e enviar diretamente para /
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
