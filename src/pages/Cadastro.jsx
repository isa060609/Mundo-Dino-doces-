import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cake, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    setLoading(true);

    try {
      await cadastrar(nome, email, password, confirmPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Cake size={32} color="#2E7D32" />
            <span>MUNDO DINO DOCES</span>
          </Link>
          <h1 className="auth-title">Crie sua conta e peça seus doces favoritos</h1>
          <p className="auth-subtitle">Cadastre-se rapidamente para realizar seus pedidos.</p>
        </div>

        {error && (
          <div className="alert-message alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
                aria-label={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Digite novamente sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha digitada'}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Ver senha digitada'}
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
          >
            {loading ? (
              <span>Criando conta...</span>
            ) : (
              <>
                <span>Criar conta</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
