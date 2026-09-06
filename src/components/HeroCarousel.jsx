import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cake, Flame, CupSoda, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    categoryName: 'Bolos no pote',
    priceInfo: 'R$ 12,00',
    description: 'Bolos fofinhos e saborosos, preparados em camadas com recheios cremosos e combinações deliciosas.',
    image: '/bolos-dino.jpg',
    icon: Cake
  },
  {
    id: 2,
    categoryName: 'Açaí',
    priceInfo: '500 ml — R$ 20,00',
    description: 'Açaí cremoso servido em garrafa de 500 ml, com opções de banana, avelã ou paçoca.',
    image: '/acai-dino.jpg',
    icon: Flame
  },
  {
    id: 3,
    categoryName: 'Vitaminas',
    priceInfo: '300 ml (R$ 15) | 500 ml (R$ 20)',
    description: 'Batidas cremosas e refrescantes de 300 ml e 500 ml, disponíveis nos sabores morango, maracujá e limão.',
    image: '/batida-dino.jpg',
    icon: CupSoda
  },
  {
    id: 4,
    categoryName: 'MUNDO DINO DOCES',
    priceInfo: 'Cardápio Completo',
    description: 'Doces artesanais, bolos no pote, açaí e vitaminas feitos com carinho para deixar seu dia mais gostoso.',
    image: '/bolos-dino.jpg',
    icon: Cake
  }
];

export default function HeroCarousel() {
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const slide = SLIDES[currentIndex];
  const IconComponent = slide.icon;

  return (
    <section className="hero-banner">
      <div className="container hero-carousel-wrapper">
        <div className="hero-grid">
          {/* Lado Esquerdo: Textos Fixos em todos os slides */}
          <div className="hero-content">
            {/* 3 Balões de navegação apenas para celular acima de Confeitaria Artesanal Online */}
            <div className="mobile-hero-nav">
              <Link to="/" className={`hero-nav-pill ${location.pathname === '/' ? 'active' : ''}`}>
                Início
              </Link>
              <Link to="/produtos" className={`hero-nav-pill ${location.pathname === '/produtos' ? 'active' : ''}`}>
                Cardápio
              </Link>
              <Link to="/encomenda" className={`hero-nav-pill ${location.pathname === '/encomenda' || location.pathname === '/pedido-personalizado' ? 'active' : ''}`}>
                Personalizado
              </Link>
            </div>

            <div className="hero-tag">
              <Sparkles size={16} />
              <span>Confeitaria Artesanal Online</span>
            </div>

            <h1 className="hero-title">
              Bem-vindo à <span className="hero-brand-highlight">MUNDO DINO DOCES</span>!
            </h1>

            <p className="hero-description">
              Bolos, açaí e vitaminas para deixar seu dia muito mais gostoso!
            </p>

            <div className="hero-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Link to="/produtos" className="btn btn-primary btn-lg">
                <span>Ver produtos</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/encomenda" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} />
                <span>Personalizar meu pedido</span>
              </Link>
            </div>
          </div>

          {/* Lado Direito: Card Visual com as Setas nas laterais */}
          <div
            className="hero-visual-card-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Seta Esquerda posicionada na lateral externa do card */}
            <button
              className="carousel-arrow-btn arrow-prev"
              onClick={prevSlide}
              aria-label="Slide anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="hero-card-display">
              {/* Em cima: Nome da Categoria, ml e valor */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--cream-bg)',
                      color: 'var(--primary-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--chocolate-brown)', fontWeight: 700, margin: 0 }}>
                      {slide.categoryName}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>MUNDO DINO DOCES</p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--primary-green-light)',
                    color: 'var(--primary-green)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '50px',
                    border: '1px solid var(--soft-green)'
                  }}
                >
                  {slide.priceInfo}
                </div>
              </div>

              {/* Imagem do Produto/Categoria com ajuste para mostrar a foto inteira */}
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: '220px',
                  backgroundColor: 'var(--cream-surface, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px'
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.categoryName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Em baixo da Imagem: Descrição da Categoria */}
              <div
                style={{
                  backgroundColor: 'var(--cream-bg)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.45, margin: 0 }}>
                  {slide.description}
                </p>
              </div>
            </div>

            {/* Seta Direita posicionada na lateral externa do card */}
            <button
              className="carousel-arrow-btn arrow-next"
              onClick={nextSlide}
              aria-label="Próximo slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Indicadores de Slide */}
        <div className="carousel-indicators">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`indicator-dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir para o slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
