import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setDropdownOpen(false);
  };

  const displayName = profile?.nome || (user?.email ? user.email.split('@')[0] : 'Minha Conta');

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand-logo" onClick={closeMenus}>
          <div className="brand-badge-icon" style={{ padding: 0, overflow: 'hidden' }}>
            <img src="/dino-logo.jpg" alt="MUNDO DINO DOCES Mascot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span>MUNDO DINO DOCES</span>
        </Link>

        <nav className="nav-desktop">
          <ul className="nav-links">
            <li><Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Início</Link></li>
            <li><Link to="/produtos" className={`nav-link ${location.pathname === '/produtos' ? 'active' : ''}`}>Cardápio</Link></li>
            <li><Link to="/encomenda" className={`nav-link ${location.pathname === '/encomenda' || location.pathname === '/pedido-personalizado' ? 'active' : ''}`}>Personalizado</Link></li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? 'Modo escuro' : 'Modo claro'} aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/carrinho" className="cart-icon-btn" title="Carrinho de Compras" aria-label="Ver Carrinho" onClick={closeMenus}>
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <div className="desktop-user-actions">
            {user ? (
              <div className="user-menu-wrapper">
                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen}>
                  <User size={18} />
                  <span>{displayName}</span>
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/minha-conta" className="dropdown-item" onClick={() => setDropdownOpen(false)}><User size={16} /><span>Minha conta</span></Link>
                    <Link to="/meus-pedidos" className="dropdown-item" onClick={() => setDropdownOpen(false)}><ShoppingBag size={16} /><span>Meus pedidos</span></Link>
                    <button className="dropdown-item logout-item" onClick={handleLogout}><LogOut size={16} /><span>Sair</span></button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Entrar</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
