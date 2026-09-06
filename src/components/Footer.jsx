import React from 'react';
import { Link } from 'react-router-dom';
import { Cake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-brand-title">MUNDO DINO DOCES</h3>
            <p className="footer-brand-desc">
              MUNDO DINO DOCES — doces feitos com carinho para deixar seu dia mais gostoso.
              Qualidade artesanal, ingredientes selecionados e entrega rápida para você.
            </p>
          </div>

          <div>
            <h4 className="footer-links-title">Nossos Doces</h4>
            <ul className="footer-links-list">
              <li><Link to="/bolos" className="footer-link">Bolos no Pote</Link></li>
              <li><Link to="/acai" className="footer-link">Açaí 500 ml</Link></li>
              <li><Link to="/vitaminas" className="footer-link">Vitaminas 200 ml</Link></li>
              <li><Link to="/produtos" className="footer-link">Todos os Produtos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-links-title">Atendimento & Redes</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://instagram.com/Mundodinodoces"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Instagram: @Mundodinodoces
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511913395183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  WhatsApp: (11) 91339-5183 (Isabella Emanuelle)
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511986341914"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  WhatsApp: (11) 98634-1914 (Pedro Henrique)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MUNDO DINO DOCES. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
