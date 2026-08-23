import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dino_doces_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dino_doces_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Erro ao salvar carrinho no localStorage:', err);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.preco * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
