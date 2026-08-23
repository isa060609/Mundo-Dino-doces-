import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function MeusPedidos() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' ou 'encomendas'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Buscar pedidos regulares
        const { data: pedidosData, error: pedidosError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('cliente_id', user.id)
          .order('criado_em', { ascending: false });

        if (pedidosError || !pedidosData) {
          const localOrders = JSON.parse(localStorage.getItem('dino_doces_orders') || '[]');
          setOrders(localOrders.filter(o => o.cliente_id === user.id));
        } else {
          setOrders(pedidosData);
        }

        // 2. Buscar encomendas personalizadas
        const { data: customData, error: customError } = await supabase
          .from('encomendas_personalizadas')
          .select('*')
          .eq('cliente_id', user.id)
          .order('data_solicitacao', { ascending: false });

        if (customError || !customData) {
          const localCustom = JSON.parse(localStorage.getItem('dino_doces_custom_orders') || '[]');
          setCustomOrders(localCustom.filter(o => o.cliente_id === user.id));
        } else {
          setCustomOrders(customData);
        }
      } catch (err) {
        console.warn('Erro ao carregar pedidos e encomendas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [user]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
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

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pendente':
        return <span className="order-status-badge status-pendente">Pendente</span>;
      case 'aguardando análise':
        return <span className="order-status-badge status-pendente">Aguardando análise</span>;
      case 'em_preparo':
      case 'em análise':
        return <span className="order-status-badge status-em_preparo">Em preparo</span>;
      case 'entregue':
      case 'concluído':
        return <span className="order-status-badge status-entregue">Concluído</span>;
      default:
        return <span className="order-status-badge status-pendente">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Meus Pedidos</h1>
          <p className="section-subtitle">
            Acompanhe o status de suas compras e encomendas personalizadas.
          </p>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {/* Abas: Pedidos Regulares vs Encomendas Personalizadas */}
        <div className="filter-bar" style={{ marginBottom: '2.5rem' }}>
          <button
            className={`filter-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            Pedidos do Cardápio ({orders.length})
          </button>
          <button
            className={`filter-btn ${activeTab === 'encomendas' ? 'active' : ''}`}
            onClick={() => setActiveTab('encomendas')}
          >
            Encomendas Personalizadas ({customOrders.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--chocolate-brown)' }}>
            Carregando seus registros...
          </div>
        ) : activeTab === 'pedidos' ? (
          orders.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <Package size={36} />
              </div>
              <h2 className="empty-state-title">Nenhum pedido encontrado</h2>
              <p className="empty-state-text">
                Você ainda não fez nenhum pedido. Que tal escolher um doce?
              </p>
              <Link to="/produtos" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Ver cardápio
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, idx) => (
                <div key={order.id || idx} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id-date">
                      <span className="order-id">
                        Pedido #{String(order.id).slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} />
                        {formatDate(order.criado_em)}
                      </span>
                    </div>

                    {renderStatusBadge(order.status)}
                  </div>

                  <div className="order-card-body">
                    <ul className="order-items-list">
                      {Array.isArray(order.produtos) &&
                        order.produtos.map((item, i) => (
                          <li key={i} className="order-item-detail">
                            <span>
                              <strong>{item.quantidade}x</strong> {item.nome}{' '}
                              {item.tamanho ? `(${item.tamanho})` : ''}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--chocolate-brown)' }}>
                              {formatPrice(item.subtotal || item.preco_unitario * item.quantidade)}
                            </span>
                          </li>
                        ))}
                    </ul>

                    {/* Detalhes de entrega se houver */}
                    {(order.forma_recebimento || order.data_desejada) && (
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {order.forma_recebimento && (
                          <p style={{ margin: '0.2rem 0' }}>
                            <strong>Forma:</strong> {order.forma_recebimento === 'Entrega' ? '🏠 Entrega' : '🛍️ Retirada'}
                            {order.endereco_entrega && ` — ${order.endereco_entrega}`}
                          </p>
                        )}
                        {order.taxa_entrega && (
                          <p style={{ margin: '0.2rem 0' }}>
                            <strong>Taxa de entrega:</strong> {order.taxa_entrega}
                          </p>
                        )}
                        {order.data_desejada && (
                          <p style={{ margin: '0.2rem 0' }}>
                            <strong>Previsão desejada:</strong> {order.data_desejada} {order.horario_desejado ? `às ${order.horario_desejado}` : ''}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="order-card-footer">
                      <span className="order-total-label">Valor total</span>
                      <span className="order-total-value">
                        {order.valor_total_label || formatPrice(order.valor_total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Aba de Encomendas Personalizadas */
          customOrders.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <Sparkles size={36} />
              </div>
              <h2 className="empty-state-title">Nenhuma encomenda personalizada</h2>
              <p className="empty-state-text">
                Deseja uma combinação ou sabor exclusivo? Solicite agora mesmo!
              </p>
              <Link to="/encomenda" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Fazer encomenda personalizada
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {customOrders.map((item, idx) => (
                <div key={item.id || idx} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id-date">
                      <span className="order-id">
                        Encomenda #{String(item.id || idx + 1).slice(-8).toUpperCase()} — {item.tipo_produto}
                      </span>
                      <span className="order-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} />
                        {formatDate(item.data_solicitacao || item.criado_em)}
                      </span>
                    </div>

                    {renderStatusBadge(item.status || 'aguardando análise')}
                  </div>

                  <div className="order-card-body">
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Descrição da solicitação:
                      </span>
                      <p style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {item.descricao}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--chocolate-brown)' }}>
                      <div>
                        <strong>Quantidade:</strong> {item.quantidade} unidade(s)
                      </div>
                      {item.forma_recebimento && (
                        <div>
                          <strong>Recebimento:</strong> {item.forma_recebimento === 'Entrega' ? '🏠 Entrega' : '🛍️ Retirada'}
                        </div>
                      )}
                      {item.data_desejada && (
                        <div>
                          <strong>Data/Horário:</strong> {item.data_desejada} {item.horario_desejado ? `às ${item.horario_desejado}` : ''}
                        </div>
                      )}
                      {item.taxa_entrega && (
                        <div>
                          <strong>Taxa:</strong> {item.taxa_entrega}
                        </div>
                      )}
                      {item.observacoes && (
                        <div>
                          <strong>Observações:</strong> {item.observacoes}
                        </div>
                      )}
                    </div>

                    {item.endereco_entrega && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <strong>Endereço:</strong> {item.endereco_entrega}
                      </p>
                    )}

                    <div className="order-card-footer" style={{ marginTop: '1.25rem' }}>
                      <span className="order-total-label">Total</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                        {item.valor_total_label || (item.subtotal ? `R$ ${item.subtotal}` : 'Aguardando análise da doceria')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
