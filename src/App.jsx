import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Bolos from './pages/Bolos';
import Acai from './pages/Acai';
import Vitaminas from './pages/Vitaminas';
import Carrinho from './pages/Carrinho';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import MeusPedidos from './pages/MeusPedidos';
import MinhaConta from './pages/MinhaConta';
import PedidoPersonalizado from './pages/PedidoPersonalizado';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/bolos" element={<Bolos />} />
                  <Route path="/acai" element={<Acai />} />
                  <Route path="/vitaminas" element={<Vitaminas />} />
                  <Route path="/carrinho" element={<Carrinho />} />
                  <Route path="/encomenda" element={<PedidoPersonalizado />} />
                  <Route path="/pedido-personalizado" element={<PedidoPersonalizado />} />
                  <Route path="/personalizar" element={<PedidoPersonalizado />} />
                  <Route path="/personalizado" element={<PedidoPersonalizado />} />

                  {/* Rotas de Visitantes (Bloqueadas se já logado) */}
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/cadastro"
                    element={
                      <GuestRoute>
                        <Cadastro />
                      </GuestRoute>
                    }
                  />

                  {/* Rotas Protegidas (Exigem Login) */}
                  <Route
                    path="/meus-pedidos"
                    element={
                      <ProtectedRoute>
                        <MeusPedidos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/minha-conta"
                    element={
                      <ProtectedRoute>
                        <MinhaConta />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback Rota 404 */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
              <FloatingContact />
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
