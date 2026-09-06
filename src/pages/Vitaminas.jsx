import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchProdutos } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Vitaminas() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProdutos('vitaminas');
        setProducts(data);
      } catch (err) {
        console.error('Erro ao carregar vitaminas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
            <h1 className="section-title">Vitaminas</h1>
            <p className="section-subtitle">
              Refrescantes e deliciosas — Opções de 300 ml (R$ 15,00) e 500 ml (R$ 20,00)
            </p>
          </div>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--chocolate-brown)' }}>
            Carregando vitaminas...
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
