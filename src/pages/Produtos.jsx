import React, { useEffect, useState } from 'react';
import { fetchProdutos } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Produtos() {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProdutos();
        setProducts(data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = activeFilter === 'todos'
    ? products
    : products.filter(p => p.categoria === activeFilter);

  return (
    <div>
      <div className="page-header-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Cardápio DINO DOCES</h1>
          <p className="section-subtitle">
            Explore nossa seleção artesanal de bolos no pote, açaí e vitaminas.
          </p>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>
        {/* Barra de Filtros */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${activeFilter === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('todos')}
          >
            Todos os Produtos
          </button>
          <button
            className={`filter-btn ${activeFilter === 'bolos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('bolos')}
          >
            Bolos no Pote
          </button>
          <button
            className={`filter-btn ${activeFilter === 'acai' ? 'active' : ''}`}
            onClick={() => setActiveFilter('acai')}
          >
            Açaí
          </button>
          <button
            className={`filter-btn ${activeFilter === 'vitaminas' ? 'active' : ''}`}
            onClick={() => setActiveFilter('vitaminas')}
          >
            Vitaminas
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--chocolate-brown)' }}>
            Carregando catálogo...
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
