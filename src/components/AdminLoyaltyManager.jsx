import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, ShoppingBag, Clock, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { adicionarCompraAdmin, getCartaoFidelidade, MAX_PONTOS, ITENS_POR_PONTO } from '../lib/fidelidade';
import { supabase } from '../lib/supabase';

export default function AdminLoyaltyManager({ currentUser }) {
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [qtdItens, setQtdItens] = useState(2);
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (selectedClienteId) {
      loadSelectedCard(selectedClienteId);
    } else {
      setSelectedCard(null);
      setSelectedCliente(null);
    }
  }, [selectedClienteId]);

  async function loadClientes() {
    setLoading(true);
    try {
      // 1. Tentar buscar da tabela 'clientes' do Supabase
      const { data, error } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
      if (!error && data && data.length > 0) {
        setClientes(data);
      } else {
        // Fallback local: pegar clientes do localStorage ou dados padrão
        const localUser = JSON.parse(localStorage.getItem('dino_doces_user') || 'null');
        const fallbackList = [];
        if (localUser) {
          fallbackList.push({
            id: localUser.id || localUser.profile?.id,
            nome: localUser.profile?.nome || localUser.email?.split('@')[0] || 'Cliente Atual',
            email: localUser.email || localUser.profile?.email || 'cliente@dinodoces.com'
          });
        }
        fallbackList.push({
          id: 'demo-cliente-isabella',
          nome: 'Isabella Ribeiro',
          email: 'isabellaribeiro418@gmail.com'
        });
        setClientes(fallbackList);
      }
    } catch (err) {
      console.warn('Erro ao carregar clientes para o admin:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectedCard(clienteId) {
    try {
      const card = await getCartaoFidelidade(clienteId);
      setSelectedCard(card);
      const found = clientes.find(c => c.id === clienteId);
      setSelectedCliente(found || { id: clienteId, nome: 'Cliente Selecionado' });
    } catch (err) {
      console.warn('Erro ao carregar cartão selecionado:', err);
    }
  }

  const handleLancarPontos = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      setErrorMsg('Por favor, selecione um cliente.');
      return;
    }
    if (qtdItens <= 0) {
      setErrorMsg('A quantidade de itens deve ser maior que 0.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await adicionarCompraAdmin(selectedClienteId, qtdItens, observacao);
      setSelectedCard(result.card);
      setSuccessMsg(
        `Lançamento realizado com sucesso! Foram adicionados +${result.pontosGanhos} ponto(s) e o cliente possui ${result.itensAcumulados} item acumulado.`
      );
      setObservacao('');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao lançar pontos.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClientes = clientes.filter(c => 
    (c.nome && c.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Previsão de cálculo ao digitar a quantidade de itens
  const currentPontos = selectedCard?.pontos || 0;
  const currentAcumulados = selectedCard?.itens_acumulados || 0;
  const totalConsiderado = currentAcumulados + (parseInt(qtdItens, 10) || 0);
  const previsaoPontosGanhos = Math.floor(totalConsiderado / ITENS_POR_PONTO);
  const previsaoSobra = totalConsiderado % ITENS_POR_PONTO;
  const previsaoTotalFinal = Math.min(MAX_PONTOS, currentPontos + previsaoPontosGanhos);

  return (
    <div className="admin-loyalty-container">
      <div className="admin-header-box">
        <div className="admin-badge-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="admin-title">Painel de Lançamento de Pontos (Administrador)</h3>
          <p className="admin-desc">
            Registre compras de clientes para creditar pontos no Cartão Fidelidade de forma segura.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-message alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-message alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleLancarPontos} className="admin-form-card">
        {/* Seleção do Cliente */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Selecione o Cliente:</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{clientes.length} cadastrados</span>
          </label>

          <input 
            type="text"
            className="form-input"
            placeholder="🔍 Filtrar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />

          <select 
            className="form-input"
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            required
          >
            <option value="">-- Selecione o cliente na lista --</option>
            {filteredClientes.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.nome} ({cli.email})
              </option>
            ))}
          </select>
        </div>

        {/* Resumo do Cartão do Cliente Selecionado */}
        {selectedCard && (
          <div className="admin-client-card-summary">
            <div className="summary-header">
              <UserCheck size={18} color="var(--primary-green)" />
              <strong>Status Atual do Cliente: {selectedCliente?.nome}</strong>
            </div>

            <div className="summary-metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Pontos Atuais:</span>
                <strong className={`metric-value ${selectedCard.pontos >= 10 ? 'complete' : ''}`}>
                  ⭐ {selectedCard.pontos}/10
                </strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">Itens Acumulados (Sobra):</span>
                <strong className="metric-value">
                  🛒 {selectedCard.itens_acumulados} item
                </strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">Total de Resgates Anteriores:</span>
                <strong className="metric-value">
                  🎁 {selectedCard.total_resgates || 0}
                </strong>
              </div>
            </div>

            {selectedCard.pontos >= 10 && (
              <div className="admin-alert-locked">
                ⚠️ Este cliente já atingiu <strong>10/10 pontos</strong>! O cartão está bloqueado aguardando o resgate de um prêmio.
              </div>
            )}
          </div>
        )}

        {/* Campos de Lançamento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Qtd. Itens Comprados:</label>
            <input 
              type="number"
              min="1"
              max="50"
              className="form-input"
              value={qtdItens}
              onChange={(e) => setQtdItens(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Referência / Observação (Opcional):</label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ex: Pedido #8491 ou Balcão"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>

        {/* Previsão do Cálculo em Tempo Real */}
        {selectedCard && selectedCard.pontos < 10 && (
          <div className="admin-calculation-preview">
            <Sparkles size={16} color="var(--primary-green)" />
            <span>
              <strong>Cálculo do sistema:</strong> {qtdItens} item(ns) + {currentAcumulados} acumulado = {totalConsiderado} itens ➔ 
              {' '}<span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>+{previsaoPontosGanhos} ponto(s)</span> e {previsaoSobra} item restante. 
              Novo total: <strong>{previsaoTotalFinal}/10</strong>.
            </span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={submitting || !selectedClienteId || (selectedCard && selectedCard.pontos >= 10)}
          style={{ marginTop: '1.5rem' }}
        >
          {submitting ? 'Lançando pontos...' : 'Confirmar e Creditar Pontos ao Cliente'}
        </button>
      </form>
    </div>
  );
}
