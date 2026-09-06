import React, { useState } from 'react';
import { Instagram, MessageCircle, Phone, X, ExternalLink } from 'lucide-react';

export default function FloatingContact() {
  const [waOpen, setWaOpen] = useState(false);

  return (
    <div className="floating-contact-container">
      {/* Popover de Contatos WhatsApp */}
      {waOpen && (
        <div className="whatsapp-popover">
          <div className="popover-header">
            <div className="popover-title-box">
              <MessageCircle size={20} color="#25D366" />
              <span>Fale Conosco no WhatsApp</span>
            </div>
            <button
              className="popover-close-btn"
              onClick={() => setWaOpen(false)}
              aria-label="Fechar contatos"
            >
              <X size={18} />
            </button>
          </div>

          <p className="popover-desc">
            Clique em um dos números abaixo para fazer seu pedido diretamente no WhatsApp:
          </p>

          <div className="whatsapp-numbers-list">
            <a
              href="https://wa.me/5511913395183?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20MUNDO%20DINO%20DOCES"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-number-card"
            >
              <div className="wa-icon-badge">
                <Phone size={16} />
              </div>
              <div className="number-info">
                <span className="number-label">Isabella Emanuelle</span>
                <span className="number-val">(11) 91339-5183</span>
              </div>
              <ExternalLink size={16} className="wa-card-arrow" />
            </a>

            <a
              href="https://wa.me/5511986341914?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20MUNDO%20DINO%20DOCES"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-number-card"
            >
              <div className="wa-icon-badge">
                <Phone size={16} />
              </div>
              <div className="number-info">
                <span className="number-label">Pedro Henrique</span>
                <span className="number-val">(11) 98634-1914</span>
              </div>
              <ExternalLink size={16} className="wa-card-arrow" />
            </a>
          </div>
        </div>
      )}

      {/* Botão Balão Instagram (Bolinha Redonda) */}
      <a
        href="https://instagram.com/Mundodinodoces"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn instagram-btn circle-btn"
        title="Siga no Instagram @Mundodinodoces"
        aria-label="Instagram @Mundodinodoces"
      >
        <Instagram size={26} />
      </a>

      {/* Botão Balão WhatsApp (Bolinha Redonda) */}
      <button
        className="floating-btn whatsapp-btn circle-btn"
        onClick={() => setWaOpen(!waOpen)}
        title="Atendimento no WhatsApp"
        aria-label="WhatsApp Atendimento"
        aria-expanded={waOpen}
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
