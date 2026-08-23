import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cake, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Caso tenha sido redirecionado a partir do carrinho
  const fromPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Tente novamente.');
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
          <h1 className="auth-title">Entrar na sua conta</h1>
          <p className="auth-subtitle">Os doces mais gostosos estão te esperando!</p>
        </div>

        {error && (
          <div className="alert-message alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <div className="form-links-row">
            <button
              type="button"
              className="auth-link"
              onClick={() => setIsForgotOpen(true)}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginBottom: '1.5rem' }}
          >
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="auth-link">
            Cadastre-se
          </Link>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
}
