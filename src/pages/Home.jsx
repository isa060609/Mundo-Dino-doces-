import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cake, Flame, CupSoda } from 'lucide-react';
import { fetchProdutos } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div>
      {/* Banner Principal em Carrossel */}
      <HeroCarousel />

      {/* Categorias: Escolha seu favorito */}
      <section className="section-padding container">
        <div className="section-header">
          <h2 className="section-title">Escolha seu favorito</h2>
          <p className="section-subtitle">
            Categorias preparadas diariamente com ingredientes frescos e selecionados.
          </p>
        </div>

        <div className="categories-grid">
          {/* Card 1: Bolos no Pote & Brownies */}
          <div className="category-card" onClick={() => navigate('/bolos')} style={{ cursor: 'pointer' }}>
            <div className="category-icon-wrapper cat-bolos">
              <Cake size={36} />
            </div>
            <h3 className="category-title">Bolos & Brownies</h3>
            <p className="category-desc">Deliciosos bolos no pote e brownies artesanais</p>
            <div className="category-price-info">R$ 12,00</div>
            <Link to="/bolos" className="btn btn-secondary btn-sm btn-full">
              Ver Bolos & Brownies
            </Link>
          </div>

          {/* Card 2: Açaí */}
          <div className="category-card" onClick={() => navigate('/acai')} style={{ cursor: 'pointer' }}>
            <div className="category-icon-wrapper cat-acai">
              <Flame size={36} />
            </div>
            <h3 className="category-title">Açaí</h3>
            <p className="category-desc">Cremoso, geladinho e cheio de sabor</p>
            <div className="category-price-info">500 ml — R$ 20,00</div>
            <Link to="/acai" className="btn btn-secondary btn-sm btn-full">
              Ver Açaí
            </Link>
          </div>

          {/* Card 3: Vitaminas */}
          <div className="category-card" onClick={() => navigate('/vitaminas')} style={{ cursor: 'pointer' }}>
            <div className="category-icon-wrapper cat-vitaminas">
              <CupSoda size={36} />
            </div>
            <h3 className="category-title">Vitaminas</h3>
            <p className="category-desc">Refrescantes e deliciosas</p>
            <div className="category-price-info">300 ml (R$ 15) | 500 ml (R$ 20)</div>
            <Link to="/vitaminas" className="btn btn-secondary btn-sm btn-full">
              Ver Vitaminas
            </Link>
          </div>
        </div>
      </section>

      {/* Vitrine de Produtos */}
      <section className="section-padding container" style={{ paddingTop: '1rem' }}>
        <div className="section-header">
          <h2 className="section-title">Nossos Doces</h2>
          <p className="section-subtitle">
            Conheça todos os nossos produtos disponíveis para entrega rápida.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--chocolate-brown)' }}>
            Carregando produtos da DINO DOCES...
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seção Faça sua Encomenda Personalizada */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div className="home-custom-banner">
          <h2 className="home-custom-banner-title">
            Faça sua encomenda personalizada
          </h2>
          <p className="home-custom-banner-desc">
            Não encontrou o que queria? Você pode solicitar uma combinação diferente de sabores, recheios e tamanhos. Trabalhamos com encomendas especiais sob medida!
          </p>
          <Link to="/encomenda" className="btn btn-primary">
            <span>Fazer pedido personalizado</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
