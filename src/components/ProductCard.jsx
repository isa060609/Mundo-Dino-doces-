import React, { useState } from 'react';
import { ShoppingBag, Check, Cake, CupSoda, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
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
      case 'vitaminas': return 'Vitamina';
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
          {product.tamanho && (
            <span className="product-size-tag">{product.tamanho}</span>
          )}
        </div>

        <p className="product-description">{product.descricao}</p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.preco)}</span>
          
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
