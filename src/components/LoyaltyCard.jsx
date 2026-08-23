import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Info, 
  Award, 
  Tag, 
  HelpCircle,
  ShoppingBag,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  MAX_PONTOS, 
  RECOMPENSAS_DISPONIVEIS, 
  getCartaoFidelidade, 
  getHistoricoResgates, 
  getHistoricoPontos,
  resgatarRecompensa 
} from '../lib/fidelidade';

export default function LoyaltyCard({ user, profile }) {
  const [card, setCard] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState('r5_off');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successVoucher, setSuccessVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const clienteId = user?.id;
  const clienteNome = profile?.nome || (user?.email ? user.email.split('@')[0] : 'Cliente');

  useEffect(() => {
    loadLoyaltyData();
  }, [clienteId]);

  async function loadLoyaltyData() {
    if (!clienteId) return;
    setLoading(true);
    try {
      const [cardData, redemptionsData, historyData] = await Promise.all([
        getCartaoFidelidade(clienteId),
        getHistoricoResgates(clienteId),
        getHistoricoPontos(clienteId)
      ]);
      setCard(cardData);
      setRedemptions(redemptionsData || []);
      setHistory(historyData || []);
    } catch (err) {
      console.warn('Erro ao carregar cartão fidelidade:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRedeem = async () => {
    if (!card || card.pontos < MAX_PONTOS) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await resgatarRecompensa(clienteId, selectedReward);
      setCard(result.card);
      setSuccessVoucher(result.voucher);
      setRedemptions(prev => [result.voucher, ...prev]);
      await loadLoyaltyData();
    } catch (err) {
      setError(err.message || 'Não foi possível resgatar o prêmio. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loyalty-loading-card">
        <div className="loyalty-spinner" />
        <p>Carregando seu Cartão Fidelidade Dino Doces...</p>
      </div>
    );
  }

  const pontos = card?.pontos || 0;
  const itensAcumulados = card?.itens_acumulados || 0;
  const isComplete = pontos >= MAX_PONTOS;
  const pontosRestantes = MAX_PONTOS - pontos;
  const progressPercent = Math.min(100, Math.round((pontos / MAX_PONTOS) * 100));

  return (
    <div className="loyalty-section-container">
      {/* CARD PRINCIPAL DO CARTÃO FIDELIDADE */}
      <div className="loyalty-main-card">
        {/* Topo do Cartão com Badge Temático e Botão de Dúvidas */}
        <div className="loyalty-header">
          <div className="loyalty-title-group">
            <div className="loyalty-dino-avatar" style={{ overflow: 'hidden', padding: 0 }}>
              <img 
                src="/dino-stamp.jpg" 
                alt="Mascote Dino Doces" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h2 className="loyalty-title">Cartão Fidelidade Dino Doces</h2>
              <p className="loyalty-subtitle">Junte pontos em suas compras e ganhe prêmios doces!</p>
            </div>
          </div>

          <button 
            className="loyalty-rules-btn"
            onClick={() => setShowRulesModal(true)}
            title="Como funciona o cartão fidelidade?"
            aria-label="Ver regras do cartão fidelidade"
          >
            <HelpCircle size={18} />
            <span>Como funciona?</span>
          </button>
        </div>

        {/* Informações de Progresso */}
        <div className="loyalty-progress-box">
          <div className="loyalty-progress-meta">
            <span className="loyalty-progress-label">Seu progresso</span>
            <div className="loyalty-points-badge">
              <Sparkles size={16} className="sparkle-icon" />
              <span>⭐ {pontos}/{MAX_PONTOS} pontos</span>
            </div>
          </div>

          {/* Barra de Progresso Visual */}
          <div className="loyalty-progress-track">
            <div 
              className={`loyalty-progress-fill ${isComplete ? 'complete' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Mensagem Dinâmica do Progresso */}
          <div className="loyalty-dynamic-message-box">
            {isComplete ? (
              <div className="loyalty-msg-complete">
                <Gift size={20} />
                <span><strong>🎉 Parabéns!</strong> Você desbloqueou uma recompensa! Escolha seu prêmio abaixo.</span>
              </div>
            ) : (
              <div className="loyalty-msg-pending">
                <span>
                  {pontosRestantes === 1 
                    ? 'Falta apenas 1 ponto para você escolher seu prêmio! 💚' 
                    : `Faltam ${pontosRestantes} pontos para você escolher seu prêmio! 💚`}
                </span>
              </div>
            )}

            {/* Aviso de item excedente acumulado */}
            {itensAcumulados > 0 && !isComplete && (
              <div className="loyalty-remainder-badge">
                <ShoppingBag size={14} />
                <span><strong>1 item acumulado</strong> aguardando mais 1 na próxima compra para virar +1 ponto!</span>
              </div>
            )}
          </div>
        </div>

        {/* GRADE DOS 10 CARIMBOS / SELOS DINO */}
        <div className="loyalty-stamps-wrapper">
          <div className="loyalty-stamps-grid">
            {Array.from({ length: MAX_PONTOS }).map((_, idx) => {
              const stampNumber = idx + 1;
              const isStamped = stampNumber <= pontos;

              return (
                <div 
                  key={idx} 
                  className={`loyalty-stamp ${isStamped ? 'stamped' : 'empty'}`}
                >
                  {isStamped ? (
                    <div className="stamp-dino-active">
                      <img 
                        src="/dino-stamp.jpg" 
                        alt={`Ponto ${stampNumber} conquistado`} 
                        className="stamp-img-dino" 
                      />
                      <span className="stamp-check">✓</span>
                    </div>
                  ) : (
                    <div className="stamp-slot-number">
                      <span>{stampNumber}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="loyalty-stamp-tip">
            Cada 2 itens comprados = 1 carimbo no seu cartão.
          </p>
        </div>

        {/* MODAL / BANNER DE SUCESSO DO RESGATE (SE ACABOU DE RESGATAR) */}
        {successVoucher && (
          <div className="loyalty-success-banner">
            <div className="success-banner-header">
              <div className="success-icon-badge">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="success-title">Prêmio Resgatado com Sucesso! 🎁</h3>
                <p className="success-subtitle">{successVoucher.titulo}</p>
              </div>
            </div>

            <div className="voucher-display-box">
              <span className="voucher-label">Seu Código de Desconto:</span>
              <div className="voucher-code-row">
                <span className="voucher-code-text">{successVoucher.codigo_voucher}</span>
                <button 
                  className="voucher-copy-btn"
                  onClick={() => copyToClipboard(successVoucher.codigo_voucher)}
                  title="Copiar código"
                >
                  {copiedCode ? <Check size={18} color="#2E7D32" /> : <Copy size={18} />}
                  <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="voucher-rules-note">{successVoucher.descricao}</p>
            </div>

            <div className="success-banner-footer">
              <p>💚 Seus pontos foram reiniciados para <strong>0/10</strong> para você começar um novo cartão fidelidade!</p>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSuccessVoucher(null)}
              >
                Fechar aviso
              </button>
            </div>
          </div>
        )}

        {/* ÁREA DE RESGATE DE PRÊMIOS */}
        <div className={`loyalty-rewards-section ${isComplete ? 'ready-to-claim' : 'locked-preview'}`}>
          <div className="rewards-section-header">
            <div className="rewards-header-title">
              <Gift size={22} className="gift-bounce-icon" />
              <h3>🎁 ESCOLHA SEU PRÊMIO!</h3>
            </div>
            {!isComplete && (
              <span className="rewards-lock-tag">
                Disponível ao atingir 10 pontos
              </span>
            )}
          </div>

          {error && (
            <div className="alert-message alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>{error}</span>
            </div>
          )}

          {/* Opções de Recompensa */}
          <div className="rewards-cards-grid">
            {RECOMPENSAS_DISPONIVEIS.map((rec) => {
              const isSelected = selectedReward === rec.id;

              return (
                <div 
                  key={rec.id}
                  className={`reward-option-card ${isSelected ? 'selected' : ''} ${!isComplete ? 'disabled' : ''}`}
                  onClick={() => isComplete && setSelectedReward(rec.id)}
                >
                  <div className="reward-card-top">
                    <span className="reward-icon-bubble">{rec.icone}</span>
                    <span className="reward-badge-tag">{rec.badge}</span>
                  </div>

                  <h4 className="reward-card-title">{rec.titulo}</h4>
                  <p className="reward-card-rule">• {rec.regra}</p>
                  <p className="reward-card-desc">{rec.descricao}</p>

                  <div className="reward-radio-box">
                    <input 
                      type="radio" 
                      name="reward-choice" 
                      id={`reward-${rec.id}`}
                      checked={isSelected}
                      disabled={!isComplete}
                      onChange={() => setSelectedReward(rec.id)}
                    />
                    <label htmlFor={`reward-${rec.id}`}>
                      {isSelected ? 'Recompensa selecionada' : 'Selecionar esta opção'}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de Confirmação de Resgate */}
          <div className="rewards-action-footer">
            <button
              className={`btn btn-primary btn-lg loyalty-claim-btn ${!isComplete ? 'btn-disabled' : ''}`}
              disabled={!isComplete || submitting}
              onClick={handleRedeem}
            >
              {submitting ? (
                <span>Confirmando resgate...</span>
              ) : isComplete ? (
                <>
                  <span>Confirmar Resgate do Prêmio</span>
                  <Sparkles size={20} />
                </>
              ) : (
                <span>Acumule 10 pontos para resgatar (Faltam {pontosRestantes})</span>
              )}
            </button>
          </div>
        </div>

        {/* SEÇÃO: HISTÓRICO DE RECOMPENSAS RESGATADAS */}
        {redemptions.length > 0 && (
          <div className="loyalty-redemptions-history">
            <div className="redemptions-history-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#2E7D32" />
                <h4>Meus Prêmios Resgatados ({redemptions.length})</h4>
              </div>
            </div>

            <div className="redemptions-list">
              {redemptions.map((item, idx) => (
                <div key={item.id || idx} className="redemption-card-item">
                  <div className="redemption-main-info">
                    <div className="redemption-title-row">
                      <span className="redemption-gift-icon">🎁</span>
                      <strong className="redemption-title">{item.titulo}</strong>
                      <span className="voucher-status-badge">
                        {item.status === 'utilizado' ? 'Utilizado' : 'Disponível para uso'}
                      </span>
                    </div>
                    <p className="redemption-desc">{item.descricao}</p>
                    <span className="redemption-date">
                      <Clock size={12} />
                      Resgatado em {formatDate(item.resgatado_em)}
                    </span>
                  </div>

                  <div className="redemption-code-badge">
                    <span className="code-label">Cupom:</span>
                    <strong className="code-value">{item.codigo_voucher}</strong>
                    <button 
                      className="mini-copy-btn"
                      onClick={() => copyToClipboard(item.codigo_voucher)}
                      title="Copiar cupom"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXTRATO DE PONTOS / HISTÓRICO EXPANSÍVEL */}
        <div className="loyalty-history-toggle-section">
          <button 
            className="history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={16} />
            <span>{showHistory ? 'Ocultar extrato de pontos' : 'Ver extrato de pontos e compras'}</span>
          </button>

          {showHistory && (
            <div className="loyalty-history-logs">
              {history.length === 0 ? (
                <p className="empty-history-text">Nenhuma movimentação de pontos registrada até o momento.</p>
              ) : (
                <div className="history-logs-list">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="history-log-row">
                      <div className="log-icon-type">
                        {h.pontos_alterados > 0 ? (
                          <span className="log-plus">+{h.pontos_alterados}</span>
                        ) : (
                          <span className="log-minus">{h.pontos_alterados}</span>
                        )}
                      </div>
                      <div className="log-details">
                        <span className="log-desc">{h.descricao}</span>
                        <span className="log-date">{formatDate(h.criado_em)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE REGRAS DO CARTÃO FIDELIDADE */}
      {showRulesModal && (
        <div className="modal-backdrop" onClick={() => setShowRulesModal(false)}>
          <div className="modal-card loyalty-rules-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🦖</span>
                <h3 style={{ margin: 0, color: 'var(--chocolate-brown)' }}>Regras do Cartão Fidelidade</h3>
              </div>
              <button 
                className="popover-close-btn"
                onClick={() => setShowRulesModal(false)}
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <div className="rules-content-body">
              <div className="rule-item-box">
                <div className="rule-num">1</div>
                <div>
                  <strong>Como pontuar:</strong>
                  <p>A cada <strong>2 itens comprados</strong> (qualquer combinação de bolos no pote, açaí ou vitaminas) = <strong>1 ponto</strong>.</p>
                </div>
              </div>

              <div className="rule-item-box">
                <div className="rule-num">2</div>
                <div>
                  <strong>Itens acumulados:</strong>
                  <p>Se comprar uma quantidade ímpar (ex: 3 itens), você ganha 1 ponto e <strong>1 item fica guardado</strong> para completar na próxima compra.</p>
                </div>
              </div>

              <div className="rule-item-box">
                <div className="rule-num">3</div>
                <div>
                  <strong>Limite de 10 pontos:</strong>
                  <p>Ao atingir 10/10 pontos, seu cartão fica bloqueado até você resgatar uma das recompensas. Seus 10 pontos ficam seguros e não expiram!</p>
                </div>
              </div>

              <div className="rule-item-box">
                <div className="rule-num">4</div>
                <div>
                  <strong>Recompensas ao chegar a 10 pontos:</strong>
                  <p>Escolha entre <strong>R$ 5 OFF</strong> ou <strong>1 adicional grátis + R$ 2 OFF</strong> (válidos em pedidos acima de R$ 20).</p>
                </div>
              </div>

              <div className="rule-item-box">
                <div className="rule-num">5</div>
                <div>
                  <strong>Novo ciclo:</strong>
                  <p>Após resgatar, seus pontos reiniciam em 0/10 para você juntar novamente, mantendo todo o seu histórico salvo!</p>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-full"
              style={{ marginTop: '1.5rem' }}
              onClick={() => setShowRulesModal(false)}
            >
              Entendi, vamos pontuar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
