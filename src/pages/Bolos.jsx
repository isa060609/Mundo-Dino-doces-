import React, { useEffect, useState } from 'react';
import { fetchProdutos } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Bolos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Bolos no Pote</h1>
          <p className="section-subtitle">
            Deliciosos sabores para adoçar seu dia — R$ 12,00 cada
          </p>
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
