import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchProdutos } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Bolos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProdutos('bolos');
        setProducts(data);
      } catch (err) {
        console.error('Erro ao carregar bolos:', err);
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
            <h1 className="section-title">Bolos no Pote</h1>
            <p className="section-subtitle">
              Deliciosos sabores para adoçar seu dia — R$ 12,00 cada
            </p>
          </div>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--chocolate-brown)' }}>
            Carregando bolos...
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
