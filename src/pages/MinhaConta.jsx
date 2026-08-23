import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoyaltyCard from '../components/LoyaltyCard';
import AdminLoyaltyManager from '../components/AdminLoyaltyManager';
import { isUserAdmin } from '../lib/fidelidade';

export default function MinhaConta() {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('fidelidade'); // 'fidelidade' | 'dados' | 'admin'
  const navigate = useNavigate();

  // Verificação estrita: somente os 2 e-mails autorizados (isabellaribeiro418@gmail.com e pedrohenrique929@icloud.com)
  const isAdmin = isUserAdmin(user, profile);

  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('fidelidade');
    }
  }, [isAdmin, activeTab]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const name = profile?.nome || (user?.email ? user.email.split('@')[0] : 'Cliente');
  const email = profile?.email || user?.email || 'N/A';
  const createdAt = profile?.criado_em || user?.created_at;

  return (
    <div>
      <div className="page-header-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Minha Conta</h1>
          <p className="section-subtitle">
            Acompanhe seus pontos de fidelidade, recompensas e dados cadastrais.
          </p>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {/* Abas de Navegação em Minha Conta */}
        <div className="filter-bar minha-conta-nav-bar" style={{ marginBottom: '2.5rem' }}>
          <button
            className={`filter-btn ${activeTab === 'fidelidade' ? 'active' : ''}`}
            onClick={() => setActiveTab('fidelidade')}
          >
            <span>🦖 Cartão Fidelidade</span>
          </button>

          <button
            className={`filter-btn ${activeTab === 'dados' ? 'active' : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            <span>👤 Meus Dados</span>
          </button>

          {/* O botão do Painel Admin aparece EXCLUSIVAMENTE para os 2 e-mails autorizados */}
          {isAdmin && (
            <button
              className={`filter-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{
                borderColor: '#2E7D32',
                backgroundColor: activeTab === 'admin' ? '#2E7D32' : '#E8F5E9',
                color: activeTab === 'admin' ? '#FFFFFF' : '#1B5E20',
                fontWeight: 700
              }}
              title="Painel exclusivo de Administrador para lançamento de pontos"
            >
              <span>👑 Painel Admin (Lojista)</span>
            </button>
          )}
        </div>

        {/* Conteúdo da Aba 1: Cartão Fidelidade */}
        {activeTab === 'fidelidade' && (
          <LoyaltyCard user={user} profile={profile} />
        )}

        {/* Conteúdo da Aba 2: Meus Dados Pessoais */}
        {activeTab === 'dados' && (
          <div className="user-profile-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="profile-avatar-circle">
                <User size={36} />
              </div>
              <h2 className="profile-user-name">{name}</h2>
              <div className="profile-badge-pill">
                <ShieldCheck size={14} />
                <span>{isAdmin ? 'Administradora Oficial' : 'Cliente Verificado'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="var(--chocolate-light)" />
                  <span>Nome completo</span>
                </label>
                <div className="form-input profile-static-input">
                  {name}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="var(--chocolate-light)" />
                  <span>E-mail</span>
                </label>
                <div className="form-input profile-static-input">
                  {email}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--chocolate-light)" />
                  <span>Data de cadastro</span>
                </label>
                <div className="form-input profile-static-input">
                  {formatDate(createdAt)}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-green btn-full logout-btn-profile"
            >
              <LogOut size={18} />
              <span>Sair da conta</span>
            </button>
          </div>
        )}

        {/* Conteúdo da Aba 3: Painel Administrativo de Pontos (Estritamente visível apenas para os 2 e-mails autorizados) */}
        {activeTab === 'admin' && isAdmin && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <AdminLoyaltyManager currentUser={user} />
          </div>
        )}
      </div>
    </div>
  );
}
