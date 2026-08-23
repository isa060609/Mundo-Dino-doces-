import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const { recuperarSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await recuperarSenha(email);
      setMessage('Instruções de redefinição enviadas para o seu e-mail!');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="modal-icon-badge">
            <Mail size={24} />
          </div>
          <h3 className="modal-title">
            Recuperação de Senha
          </h3>
          <p className="modal-subtitle">
            Informe seu e-mail cadastrado para receber o link de redefinição.
          </p>
        </div>

        {error && (
          <div className="alert-message alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert-message alert-success">
            <CheckCircle size={18} />
            <span>{message}</span>
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
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </form>
      </div>
    </div>
  );
}
