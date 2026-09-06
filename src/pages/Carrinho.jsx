import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, MapPin, Clock, Calendar
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDistance, getDeliveryFee, isWeekday, validateDeliveryTime } from '../lib/delivery';

export default function Carrinho() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  /* Dados de entrega e checkout */
  const [nome, setNome]               = useState(profile?.nome || (user?.email ? user.email.split('@')[0] : ''));
  const [formaRecebimento, setForma]  = useState('Entrega');
  const [endereco, setEndereco]       = useState('');
  const [dataDesejada, setData]       = useState('');
  const [horarioDesejado, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  /* UI */
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState(null);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  /* ── Distância e Taxa de Entrega ────────────────────────────── */
  const distanciaKm = useMemo(() => {
    if (formaRecebimento !== 'Entrega') return null;
    return calculateDistance(endereco);
  }, [formaRecebimento, endereco]);

  const deliveryInfo = useMemo(() => {
    return getDeliveryFee(distanciaKm, formaRecebimento);
  }, [distanciaKm, formaRecebimento]);

  /* ── Validação de Horário de Entrega em tempo real ──────────── */
  const isWeekdaySelected = useMemo(() => isWeekday(dataDesejada), [dataDesejada]);
  const isTimeInvalid = useMemo(() => {
    if (!dataDesejada || !horarioDesejado || formaRecebimento !== 'Entrega') return false;
    const res = validateDeliveryTime(dataDesejada, horarioDesejado);
    return !res.valid;
  }, [dataDesejada, horarioDesejado, formaRecebimento]);

  /* ── Total Final ────────────────────────────────────────────── */
  const valorTotalFinal = useMemo(() => {
    if (formaRecebimento === 'Retirada') {
      return formatPrice(cartTotal);
    }
    if (deliveryInfo.fee === null) {
      return 'A combinar';
    }
    return formatPrice(cartTotal + deliveryInfo.fee);
  }, [formaRecebimento, cartTotal, deliveryInfo]);

  const handleCheckout = async () => {
    setError(null);

    // 1. Se não estiver autenticado, enviar para /login
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/carrinho' } } });
      return;
    }

    if (cartItems.length === 0) return;

    if (!nome.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (formaRecebimento === 'Entrega' && !endereco.trim()) {
      setError('Por favor, informe seu endereço completo de entrega.');
      return;
    }

    if (!dataDesejada || !horarioDesejado) {
      setError('Por favor, selecione a data e o horário desejados para o pedido.');
      return;
    }

    if (formaRecebimento === 'Entrega') {
      const timeValidation = validateDeliveryTime(dataDesejada, horarioDesejado);
      if (!timeValidation.valid) {
        setError(timeValidation.error);
        return;
      }
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        cliente_id: user.id,
        nome_cliente: nome.trim() || profile?.nome || 'Cliente',
        produtos: cartItems.map(item => ({
          id: item.product.id,
          nome: item.product.nome,
          quantidade: item.quantity,
          preco_unitario: item.product.preco,
          subtotal: item.product.preco * item.quantity,
          tamanho: item.product.tamanho || null
        })),
        forma_recebimento: formaRecebimento,
        endereco_entrega: formaRecebimento === 'Entrega' ? endereco.trim() : null,
        distancia_km: distanciaKm,
        taxa_entrega: deliveryInfo.label,
        taxa_entrega_valor: deliveryInfo.fee,
        data_desejada: dataDesejada,
        horario_desejado: horarioDesejado,
        observacoes: observacoes.trim() || null,
        subtotal_itens: cartTotal,
        valor_total: deliveryInfo.fee !== null ? cartTotal + deliveryInfo.fee : cartTotal,
        valor_total_label: valorTotalFinal,
        status: 'pendente',
        criado_em: new Date().toISOString()
      };

      // Tentar salvar no Supabase 'pedidos'
      const { error: dbError } = await supabase.from('pedidos').insert([orderPayload]);

      if (dbError) {
        console.warn('Erro ao inserir pedido no Supabase, armazenando localmente:', dbError);
        const existingOrders = JSON.parse(localStorage.getItem('dino_doces_orders') || '[]');
        orderPayload.id = 'ped-' + Date.now();
        localStorage.setItem('dino_doces_orders', JSON.stringify([orderPayload, ...existingOrders]));
      }

      setSuccess(true);
      clearCart();
    } catch (err) {
      setError('Erro ao processar seu pedido. Tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container section-padding">
        <div className="empty-state-card order-success-card">
          <div className="empty-state-icon order-success-icon">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="empty-state-title order-success-title">
            Pedido realizado com sucesso!
          </h2>
          <p className="empty-state-text order-success-text">
            Seu pedido foi recebido com carinho e já está sendo preparado.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/meus-pedidos" className="btn btn-primary">
              Acompanhar meus pedidos
            </Link>
            <Link to="/produtos" className="btn btn-secondary">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container section-padding">
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <ShoppingBag size={36} />
          </div>
          <h2 className="empty-state-title">Seu carrinho está vazio</h2>
          <p className="empty-state-text">
            Que tal escolher alguns doces, açaís ou vitaminas deliciosos para o seu dia?
          </p>
          <Link to="/produtos" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-banner">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-back-action"
              title="Voltar à página inicial"
            >
              <ArrowLeft size={18} />
              <span>Voltar ao Início</span>
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 className="section-title">Carrinho de Compras</h1>
            <p className="section-subtitle">
              Revise seus itens e escolha o melhor momento para saborear.
            </p>
          </div>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {error && (
          <div className="alert-message alert-error" style={{ marginBottom: '2rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="cart-layout">
          {/* Tabela / Lista de itens */}
          <div className="cart-table-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--chocolate-brown)' }}>
              Seus itens ({cartItems.length})
            </h2>

            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="cart-item-row">
                <div className="cart-item-thumb">
                  {product.imagem ? (
                    <img src={product.imagem} alt={product.nome} />
                  ) : (
                    <ShoppingBag size={24} color="#5D4037" />
                  )}
                </div>

                <div className="cart-item-details">
                  <span className="cart-item-title">{product.nome}</span>
                  <span className="cart-item-unit-price">
                    {formatPrice(product.preco)} cada {product.tamanho ? `(${product.tamanho})` : ''}
                  </span>
                </div>

                <div className="quantity-picker">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(product.id, -1)}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(product.id, 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  {formatPrice(product.preco * quantity)}
                </div>

                <button
                  className="cart-item-remove-btn"
                  onClick={() => removeFromCart(product.id)}
                  title="Remover item"
                  aria-label={`Remover ${product.nome}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {/* Seção de Entrega / Retirada no Carrinho */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--chocolate-brown)', marginBottom: '1rem' }}>
                🚚 Informações de Entrega
              </h3>

              <div className="cp-options-wrap" style={{ marginBottom: '1rem' }}>
                {[
                  { value: 'Entrega',  label: '🏠 Entrega' },
                  { value: 'Retirada', label: '🛍️ Retirada' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForma(opt.value)}
                    className={`cp-option-btn${formaRecebimento === opt.value ? ' selected' : ''}`}
                    style={{ fontSize: '0.95rem', padding: '0.65rem 1.5rem' }}
                  >
                    {formaRecebimento === opt.value && <CheckCircle2 size={14} />}
                    {opt.label}
                  </button>
                ))}
              </div>

              {formaRecebimento === 'Entrega' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Endereço de entrega</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Digite seu endereço completo ou CEP"
                      value={endereco}
                      onChange={e => setEndereco(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cp-delivery-fee-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                        <MapPin size={18} />
                        <span>
                          {distanciaKm !== null
                            ? `Distância calculada: ~${distanciaKm} km`
                            : 'Informe seu endereço ou CEP para calcular a taxa'}
                        </span>
                      </div>
                      <span className="cp-delivery-badge">
                        Taxa: {deliveryInfo.label}
                      </span>
                    </div>

                    <div className="cp-delivery-tiers-list">
                      <span className={distanciaKm !== null && distanciaKm <= 2 ? 'tier-active' : ''}>• Até 2 km: R$ 5</span>
                      <span className={distanciaKm !== null && distanciaKm > 2 && distanciaKm <= 5 ? 'tier-active' : ''}>• Mais de 2 até 5 km: R$ 8</span>
                      <span className={distanciaKm !== null && distanciaKm > 5 && distanciaKm <= 10 ? 'tier-active' : ''}>• Mais de 5 até 10 km: R$ 12</span>
                      <span className={distanciaKm !== null && distanciaKm > 10 ? 'tier-active' : ''}>• Acima de 10 km: A combinar</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Horários de Entrega */}
              <div className="cp-schedule-info-box" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                  <Clock size={18} />
                  <span>Horários de entrega</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <li><strong>Segunda a sexta-feira:</strong> entregas a partir das <strong>18h</strong>.</li>
                  <li><strong>Sábados e domingos:</strong> entregas em <strong>qualquer horário</strong>, mediante disponibilidade.</li>
                </ul>
              </div>

              {/* Agendamento Data e Hora */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">📅 Data desejada</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataDesejada}
                    onChange={e => setData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {dataDesejada && (
                    <p style={{ fontSize: '0.8rem', color: isWeekdaySelected ? 'var(--primary-green)' : 'var(--chocolate-brown)', marginTop: '0.3rem', fontWeight: 500 }}>
                      {isWeekdaySelected ? '🗓️ Dia de semana (Entregas a partir das 18h)' : '🎉 Fim de semana (Qualquer horário)'}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">🕐 Horário desejado</label>
                  <input
                    type="time"
                    className={`form-input${isTimeInvalid ? ' input-warning' : ''}`}
                    value={horarioDesejado}
                    onChange={e => setHorario(e.target.value)}
                    min={isWeekdaySelected && formaRecebimento === 'Entrega' ? '18:00' : undefined}
                    required
                  />
                  {isTimeInvalid && (
                    <p style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '0.3rem', fontWeight: 600 }}>
                      ⚠️ De segunda a sexta-feira, entregas são a partir das 18h.
                    </p>
                  )}
                </div>
              </div>

              {/* Dados do Cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome do cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Observações do pedido (Opcional)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Instruções para entrega, troco, embalagem para presente..."
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Resumo do Pedido</h3>

            <div className="summary-row">
              <span>Subtotal dos itens</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className="summary-row">
              <span>Taxa de entrega</span>
              <span style={{ fontWeight: 600, color: formaRecebimento === 'Retirada' ? 'var(--primary-green)' : 'var(--chocolate-brown)' }}>
                {deliveryInfo.label}
              </span>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span>{valorTotalFinal}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-full"
              disabled={submitting || isTimeInvalid}
              style={{ marginTop: '1.5rem' }}
            >
              {submitting ? (
                <span>Finalizando...</span>
              ) : (
                <>
                  <span>Finalizar pedido</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {!user && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Você precisará fazer login para concluir a compra.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

