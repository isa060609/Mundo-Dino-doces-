import React, { useState } from 'react';
import { ShoppingBag, Check, Cake, CupSoda, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedTamanho, setSelectedTamanho] = useState(
    product.tamanhos ? product.tamanhos[0] : null
  );

  const currentPrice = selectedTamanho ? selectedTamanho.preco : product.preco;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      id: selectedTamanho ? `${product.id}-${selectedTamanho.tamanho}` : product.id,
      tamanho: selectedTamanho ? selectedTamanho.tamanho : product.tamanho,
      preco: currentPrice
    };
    addToCart(itemToAdd, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const renderBadgeClass = (cat) => {
    switch (cat) {
      case 'bolos': return 'badge-bolos';
      case 'acai': return 'badge-acai';
      case 'vitaminas': return 'badge-vitaminas';
      default: return 'badge-bolos';
    }
  };

  const getCategoryName = (cat) => {
    switch (cat) {
      case 'bolos': return 'Bolo no pote';
      case 'acai': return 'Açaí';
      case 'vitaminas': return 'Batida';
      default: return cat;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'bolos': return <Cake size={28} />;
      case 'acai': return <Flame size={28} />;
      case 'vitaminas': return <CupSoda size={28} />;
      default: return <Cake size={28} />;
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-box">
        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.nome}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className="product-image-fallback"
          style={{ display: product.imagem ? 'none' : 'flex' }}
        >
          {getCategoryIcon(product.categoria)}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>MUNDO DINO DOCES</span>
        </div>

        <span className={`badge ${renderBadgeClass(product.categoria)} product-badge-abs`}>
          {getCategoryName(product.categoria)}
        </span>
      </div>

      <div className="product-content">
        <div className="product-header-info">
          <h3 className="product-title">{product.nome}</h3>
          {!product.tamanhos && product.tamanho && (
            <span className="product-size-tag">{product.tamanho}</span>
          )}
        </div>

        <p className="product-description">{product.descricao}</p>

        {/* Seletor de Tamanhos quando houver opções (ex: 300 ml e 500 ml) */}
        {product.tamanhos && (
          <div style={{ margin: '0.75rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tamanho:</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {product.tamanhos.map((t) => {
                const isSelected = selectedTamanho?.tamanho === t.tamanho;
                return (
                  <button
                    key={t.tamanho}
                    type="button"
                    onClick={() => setSelectedTamanho(t)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--primary-green)' : '1.5px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-green)' : 'var(--cream-bg)',
                      color: isSelected ? '#FFFFFF' : 'var(--chocolate-brown)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {t.tamanho}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="product-footer">
          <span className="product-price">{formatPrice(currentPrice)}</span>
          
          <button
            onClick={handleAddToCart}
            className="add-cart-btn"
            aria-label={`Adicionar ${product.nome} ao carrinho`}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>Adicionado</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Adicionar ao carrinho</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
