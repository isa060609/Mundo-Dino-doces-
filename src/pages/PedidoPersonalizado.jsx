import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertCircle, Info, ArrowRight, Clock,
  Layers, Shuffle, PlusCircle, Apple, Wand2, Gift,
  ChevronDown, ChevronUp, MapPin, Calendar, Trash2, Plus, Minus,
  ShoppingBag, ArrowLeft, Cake, Flame, CupSoda
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDistance, getDeliveryFee, isWeekday, validateDeliveryTime } from '../lib/delivery';

/* ─── Definição das Categorias Principais ───────────────────────── */
const CATEGORIAS = [
  { id: 'bolos',   nome: 'Bolos',   icon: '🍰', sub: 'Bolos no pote e encomendas' },
  { id: 'acai',    nome: 'Açaí',    icon: '🥣', sub: 'Açaí com frutas e complementos' },
  { id: 'batidas', nome: 'Batidas', icon: '🥤', sub: 'Batidas cremosas e refrescantes' }
];

/* ─── Dados dos 6 cards de Bolos ────────────────────────────────── */
const BOLO_CARDS = [
  {
    icon: Shuffle,
    title: 'Misturar sabores',
    desc: 'Combine duas ou mais massas e recheios diferentes no mesmo pote.'
  },
  {
    icon: Layers,
    title: 'Escolher outro recheio',
    desc: 'Peça recheios especiais como brigadeiro gourmet, ninho com nutella e mais.'
  },
  {
    icon: Apple,
    title: 'Adicionar frutas',
    desc: 'Acrescente morangos frescos, uvas, banana ou calda natural de maracujá.'
  },
  {
    icon: Wand2,
    title: 'Combinar fora do cardápio',
    desc: 'Crie uma receita exclusiva que não está pronta para entrega.'
  },
  {
    icon: PlusCircle,
    title: 'Alterar sabor ou tamanho',
    desc: 'Ajuste a intensidade do doce, pontos de calda ou porções maiores.'
  },
  {
    icon: Gift,
    title: 'Encomenda especial',
    desc: 'Lembrancinhas, kits para presentes e festas de aniversário.'
  }
];

/* Opções de Bolos */
const MASSAS_BOLO       = ['Chocolate', 'Baunilha'];
const RECHEIOS_BOLO     = ['Brigadeiro de chocolate', 'Maracujá', 'Prestígio', 'Brigadeiro de leite', 'Chocolate', 'Beijinho'];
const FRUTAS_BOLO       = ['Morango', 'Uva', 'Banana', 'Maracujá'];
const TAMANHOS_BOLO     = [
  { label: '150 ml', preco: 8 },
  { label: '250 ml', preco: 12 },
  { label: '350 ml', preco: 16 }
];
const INTENSIDADES_BOLO = ['Menos doce', 'Normal', 'Mais doce'];
const CALDAS_BOLO       = ['Pouca calda', 'Calda normal', 'Muita calda'];
const ENCOMENDAS_BOLO   = [
  '🍬 Docinhos de festa',
  '🎂 Bolo de aniversário',
  '🧁 Cupcakes',
  '🧁 Bolos em forminhas',
  '🍫 Trufas',
  '🍪 Cookies decorados',
  '🎁 Kit festa'
];

/* ─── Dados dos 3 cards de Açaí ─────────────────────────────────── */
const ACAI_CARDS = [
  {
    icon: PlusCircle,
    title: 'Escolha o tamanho',
    desc: 'Opções de 300 ml e 500 ml servidos com açaí cremoso.'
  },
  {
    icon: Apple,
    title: 'Escolha sua fruta',
    desc: '1 fruta inclusa sem custo. Frutas adicionais por + R$ 2 cada.'
  },
  {
    icon: Layers,
    title: 'Escolha seus complementos',
    desc: '1 calda + 1 complemento inclusos. Adicionais por + R$ 2 cada.'
  }
];

const TAMANHOS_ACAI     = [
  { label: '300 ml', preco: 15 },
  { label: '500 ml', preco: 20 }
];
const FRUTAS_ACAI       = ['Nenhuma', 'Banana', 'Morango'];
const CALDAS_ACAI       = ['Sem calda', 'Chocolate', 'Morango', 'Caramelo'];
const COMPLEMENTOS_ACAI = ['Leite em pó', 'Paçoca', 'Creme de avelã'];

/* ─── Dados dos 3 cards de Batidas ──────────────────────────────── */
const BATIDA_CARDS = [
  {
    icon: PlusCircle,
    title: 'Escolha o tamanho',
    desc: 'Opções de 300 ml e 500 ml preparadas na hora.'
  },
  {
    icon: Apple,
    title: 'Escolha o sabor',
    desc: 'Sabores naturais de morango, maracujá e limão.'
  },
  {
    icon: Layers,
    title: 'Escolha o acompanhamento',
    desc: 'Geleias artesanais ou leite condensado cremoso.'
  }
];

const TAMANHOS_BATIDA       = [
  { label: '300 ml', preco: 15 },
  { label: '500 ml', preco: 20 }
];
const SABORES_BATIDA        = ['🍓 Morango', '🥭 Maracujá', '🍋 Limão'];
const ACOMPANHAMENTOS_BATIDA = ['🍓 Geleia de morango', '🥭 Geleia de maracujá', '🥛 Leite condensado'];

/* ─── Botões de Opção Reutilizáveis ─────────────────────────────── */
function OptionBtn({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cp-option-btn${selected ? ' selected' : ''}`}
    >
      {selected && <CheckCircle2 size={13} />}
      {children}
    </button>
  );
}

function OptionsWrap({ children }) {
  return <div className="cp-options-wrap">{children}</div>;
}

/* ─── Componente Principal ──────────────────────────────────────── */
export default function PedidoPersonalizado() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  /* Categoria selecionada ('bolos' | 'acai' | 'batidas') */
  const [categoriaAtual, setCategoriaAtual] = useState('bolos');

  /* Itens adicionados ao Pedido / Carrinho */
  const [itensPedido, setItensPedido] = useState([]);
  const [itemAdicionadoMsg, setItemAdicionadoMsg] = useState(null);

  /* ── Estado da Personalização de BOLO ── */
  const [activeBoloCard, setActiveBoloCard]       = useState(null);
  const [massaBolo, setMassaBolo]                 = useState('');
  const [recheioBolo, setRecheioBolo]             = useState('');
  const [frutasBolo, setFrutasBolo]               = useState([]);
  const [descBoloCustom, setDescBoloCustom]       = useState('');
  const [tamanhoBolo, setTamanhoBolo]             = useState(null);
  const [intensidadeBolo, setIntensidadeBolo]     = useState('');
  const [caldaBolo, setCaldaBolo]                 = useState('');
  const [encomendaBolo, setEncomendaBolo]         = useState('');

  /* ── Estado da Personalização de AÇAÍ ── */
  const [activeAcaiCard, setActiveAcaiCard]       = useState(null);
  const [tamanhoAcai, setTamanhoAcai]             = useState(null);
  const [frutasAcai, setFrutasAcai]               = useState([]);
  const [caldaAcai, setCaldaAcai]                 = useState('');
  const [complementosAcai, setComplementosAcai]   = useState([]);

  /* ── Estado da Personalização de BATIDAS ── */
  const [activeBatidaCard, setActiveBatidaCard]   = useState(null);
  const [tamanhoBatida, setTamanhoBatida]         = useState(null);
  const [saborBatida, setSaborBatida]             = useState('');
  const [acompBatida, setAcompBatida]             = useState('');

  /* ── Dados do Checkout / Entrega ── */
  const [nome, setNome]               = useState(profile?.nome || (user?.email ? user.email.split('@')[0] : ''));
  const [formaRecebimento, setForma]  = useState('Entrega');
  const [endereco, setEndereco]       = useState('');
  const [dataDesejada, setData]       = useState('');
  const [horarioDesejado, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  /* UI */
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  /* ── Toggles de Frutas/Complementos ── */
  const toggleFrutaBolo = (f) => {
    setFrutasBolo(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const toggleFrutaAcai = (f) => {
    if (f === 'Nenhuma') {
      setFrutasAcai(['Nenhuma']);
      return;
    }
    setFrutasAcai(prev => {
      const filtered = prev.filter(x => x !== 'Nenhuma');
      return filtered.includes(f) ? filtered.filter(x => x !== f) : [...filtered, f];
    });
  };

  const toggleComplementoAcai = (c) => {
    setComplementosAcai(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  /* ── Cálculo de Preço do Item Atual em Construção ── */
  const currentItemPrice = useMemo(() => {
    if (categoriaAtual === 'bolos') {
      if (!tamanhoBolo) return { preco: null, label: 'A combinar' };
      return { preco: tamanhoBolo.preco, label: `R$ ${tamanhoBolo.preco.toFixed(2).replace('.', ',')}` };
    }

    if (categoriaAtual === 'acai') {
      if (!tamanhoAcai) return { preco: null, label: 'Selecione o tamanho' };
      const realFruits = frutasAcai.filter(f => f !== 'Nenhuma');
      const extraFruits = Math.max(0, realFruits.length - 1);
      const extraComps  = Math.max(0, complementosAcai.length - 1);
      const total = tamanhoAcai.preco + (extraFruits * 2) + (extraComps * 2);
      return { preco: total, label: `R$ ${total.toFixed(2).replace('.', ',')}` };
    }

    if (categoriaAtual === 'batidas') {
      if (!tamanhoBatida) return { preco: null, label: 'Selecione o tamanho' };
      return { preco: tamanhoBatida.preco, label: `R$ ${tamanhoBatida.preco.toFixed(2).replace('.', ',')}` };
    }

    return { preco: null, label: 'A combinar' };
  }, [
    categoriaAtual, tamanhoBolo,
    tamanhoAcai, frutasAcai, complementosAcai,
    tamanhoBatida
  ]);

  /* ── Validação se o item atual tem ao menos 1 escolha para adicionar ── */
  const canAddItem = useMemo(() => {
    if (categoriaAtual === 'bolos') {
      return !!(massaBolo || recheioBolo || frutasBolo.length || descBoloCustom.trim() || tamanhoBolo || intensidadeBolo || caldaBolo || encomendaBolo);
    }
    if (categoriaAtual === 'acai') {
      return !!(tamanhoAcai || frutasAcai.length || caldaAcai || complementosAcai.length);
    }
    if (categoriaAtual === 'batidas') {
      return !!(tamanhoBatida || saborBatida || acompBatida);
    }
    return false;
  }, [
    categoriaAtual, massaBolo, recheioBolo, frutasBolo, descBoloCustom, tamanhoBolo, intensidadeBolo, caldaBolo, encomendaBolo,
    tamanhoAcai, frutasAcai, caldaAcai, complementosAcai,
    tamanhoBatida, saborBatida, acompBatida
  ]);

  /* ── Adicionar Item Atual ao Carrinho / Pedido ── */
  const handleAddItemToOrder = () => {
    if (!canAddItem) return;

    let novoItem = null;
    const itemId = 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    if (categoriaAtual === 'bolos') {
      const detalhes = [];
      if (massaBolo)              detalhes.push(`Massa: ${massaBolo}`);
      if (recheioBolo)            detalhes.push(`Recheio: ${recheioBolo}`);
      if (frutasBolo.length)      detalhes.push(`Frutas: ${frutasBolo.join(', ')}`);
      if (tamanhoBolo)            detalhes.push(`Tamanho: ${tamanhoBolo.label}`);
      if (intensidadeBolo)        detalhes.push(`Intensidade: ${intensidadeBolo}`);
      if (caldaBolo)              detalhes.push(`Calda: ${caldaBolo}`);
      if (encomendaBolo)          detalhes.push(`Tipo: ${encomendaBolo}`);
      if (descBoloCustom.trim())  detalhes.push(`Customizado: "${descBoloCustom.trim()}"`);

      novoItem = {
        id: itemId,
        categoria: 'Bolo',
        icon: '🍰',
        titulo: encomendaBolo || (tamanhoBolo ? `Bolo no pote (${tamanhoBolo.label})` : 'Bolo personalizado'),
        detalhes,
        precoUnitario: currentItemPrice.preco,
        isCustomPrice: currentItemPrice.preco === null,
        quantidade: 1
      };

      // Resetar form de bolo
      setMassaBolo('');
      setRecheioBolo('');
      setFrutasBolo([]);
      setDescBoloCustom('');
      setTamanhoBolo(null);
      setIntensidadeBolo('');
      setCaldaBolo('');
      setEncomendaBolo('');
      setActiveBoloCard(null);
    } else if (categoriaAtual === 'acai') {
      const detalhes = [];
      if (tamanhoAcai)            detalhes.push(`Tamanho: ${tamanhoAcai.label}`);
      if (frutasAcai.length)      detalhes.push(`Fruta(s): ${frutasAcai.join(', ')}`);
      if (caldaAcai)              detalhes.push(`Calda: ${caldaAcai}`);
      if (complementosAcai.length) detalhes.push(`Complemento(s): ${complementosAcai.join(', ')}`);

      novoItem = {
        id: itemId,
        categoria: 'Açaí',
        icon: '🥣',
        titulo: `Açaí ${tamanhoAcai ? tamanhoAcai.label : 'Personalizado'}`,
        detalhes,
        precoUnitario: currentItemPrice.preco,
        isCustomPrice: currentItemPrice.preco === null,
        quantidade: 1
      };

      // Resetar form de açaí
      setTamanhoAcai(null);
      setFrutasAcai([]);
      setCaldaAcai('');
      setComplementosAcai([]);
      setActiveAcaiCard(null);
    } else if (categoriaAtual === 'batidas') {
      const detalhes = [];
      if (tamanhoBatida) detalhes.push(`Tamanho: ${tamanhoBatida.label}`);
      if (saborBatida)   detalhes.push(`Sabor: ${saborBatida}`);
      if (acompBatida)   detalhes.push(`Acompanhamento: ${acompBatida}`);

      novoItem = {
        id: itemId,
        categoria: 'Batida',
        icon: '🥤',
        titulo: `Batida ${saborBatida ? saborBatida.replace(/[^a-zA-ZáéíóúÁÉÍÓÚãõÃÕâêîôûÂÊÎÔÛçÇ ]/g, '').trim() : ''} ${tamanhoBatida ? `(${tamanhoBatida.label})` : ''}`,
        detalhes,
        precoUnitario: currentItemPrice.preco,
        isCustomPrice: currentItemPrice.preco === null,
        quantidade: 1
      };

      // Resetar form de batidas
      setTamanhoBatida(null);
      setSaborBatida('');
      setAcompBatida('');
      setActiveBatidaCard(null);
    }

    if (novoItem) {
      setItensPedido(prev => [...prev, novoItem]);
      setItemAdicionadoMsg(`Item adicionado com sucesso!`);
      setTimeout(() => setItemAdicionadoMsg(null), 3500);
    }
  };

  /* ── Controles de Quantidade do Carrinho ── */
  const updateItemQty = (id, delta) => {
    setItensPedido(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItensPedido(prev => prev.filter(item => item.id !== id));
  };

  /* ── Subtotal de Todos os Itens do Pedido ── */
  const subtotalGeral = useMemo(() => {
    let sum = 0;
    let hasCustom = false;

    if (itensPedido.length === 0) return null;

    for (const item of itensPedido) {
      if (item.precoUnitario === null) {
        hasCustom = true;
      } else {
        sum += item.precoUnitario * item.quantidade;
      }
    }

    return { valor: sum, hasCustom };
  }, [itensPedido]);

  /* ── Distância e Taxa de Entrega ── */
  const distanciaKm = useMemo(() => {
    if (formaRecebimento !== 'Entrega') return null;
    return calculateDistance(endereco);
  }, [formaRecebimento, endereco]);

  const deliveryInfo = useMemo(() => {
    return getDeliveryFee(distanciaKm, formaRecebimento);
  }, [distanciaKm, formaRecebimento]);

  /* ── Validação de Horários ── */
  const isWeekdaySelected = useMemo(() => isWeekday(dataDesejada), [dataDesejada]);
  const isTimeInvalid = useMemo(() => {
    if (!dataDesejada || !horarioDesejado || formaRecebimento !== 'Entrega') return false;
    const res = validateDeliveryTime(dataDesejada, horarioDesejado);
    return !res.valid;
  }, [dataDesejada, horarioDesejado, formaRecebimento]);

  /* ── Valor Total Geral ── */
  const totalGeralLabel = useMemo(() => {
    if (!subtotalGeral) return 'A combinar';

    if (formaRecebimento === 'Retirada') {
      if (subtotalGeral.hasCustom && subtotalGeral.valor === 0) return 'A combinar';
      if (subtotalGeral.hasCustom) return `R$ ${subtotalGeral.valor.toFixed(2).replace('.', ',')} (+ a combinar)`;
      return `R$ ${subtotalGeral.valor.toFixed(2).replace('.', ',')}`;
    }

    if (formaRecebimento === 'Entrega') {
      if (deliveryInfo.fee === null) return 'A combinar';
      if (subtotalGeral.hasCustom && subtotalGeral.valor === 0) return 'A combinar';
      const tot = subtotalGeral.valor + deliveryInfo.fee;
      if (subtotalGeral.hasCustom) return `R$ ${tot.toFixed(2).replace('.', ',')} (+ a combinar)`;
      return `R$ ${tot.toFixed(2).replace('.', ',')}`;
    }

    return `R$ ${subtotalGeral.valor.toFixed(2).replace('.', ',')}`;
  }, [subtotalGeral, formaRecebimento, deliveryInfo]);

  /* ── Finalização / Envio do Pedido ── */
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/encomenda' } } });
      return;
    }

    if (itensPedido.length === 0) {
      // Se o cliente configurou algo mas ainda não clicou em "Adicionar ao pedido", adicione automaticamente
      if (canAddItem) {
        handleAddItemToOrder();
      } else {
        setError('Por favor, personalize e adicione ao menos um item ao seu pedido.');
        return;
      }
    }

    if (!nome.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (!formaRecebimento) {
      setError('Por favor, selecione a forma de recebimento (Entrega ou Retirada).');
      return;
    }

    if (formaRecebimento === 'Entrega' && !endereco.trim()) {
      setError('Por favor, informe o endereço completo de entrega.');
      return;
    }

    if (!dataDesejada || !horarioDesejado) {
      setError('Por favor, informe a data e horário desejados para o pedido.');
      return;
    }

    if (formaRecebimento === 'Entrega') {
      const timeValidation = validateDeliveryTime(dataDesejada, horarioDesejado);
      if (!timeValidation.valid) {
        setError(timeValidation.error);
        return;
      }
    }

    setLoading(true);

    try {
      const descricaoConsolidada = itensPedido.map((item, idx) => {
        return `[Item ${idx + 1}] ${item.icon} ${item.titulo} (Qtd: ${item.quantidade}) - ${item.precoUnitario ? `R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}` : 'A combinar'}\n${item.detalhes.map(d => `  • ${d}`).join('\n')}`;
      }).join('\n\n');

      const payload = {
        cliente_id:               user.id,
        nome_cliente:             nome.trim() || profile?.nome || 'Cliente',
        tipo_produto:             itensPedido.map(i => i.categoria).join(', ') || 'Personalizado',
        descricao:                descricaoConsolidada,
        quantidade:               itensPedido.reduce((acc, cur) => acc + cur.quantidade, 0) || 1,
        observacoes:              observacoes.trim() || null,
        status:                   'aguardando análise',
        data_solicitacao:         new Date().toISOString(),
        /* Dados do Pedido */
        itens_personalizados:     itensPedido,
        forma_recebimento:        formaRecebimento,
        endereco_entrega:         formaRecebimento === 'Entrega' ? endereco.trim() : null,
        distancia_km:             distanciaKm,
        taxa_entrega:             deliveryInfo.label,
        taxa_entrega_valor:       deliveryInfo.fee,
        data_desejada:            dataDesejada,
        horario_desejado:         horarioDesejado,
        subtotal:                 subtotalGeral?.valor || 0,
        valor_total_label:        totalGeralLabel
      };

      const { error: dbError } = await supabase
        .from('encomendas_personalizadas')
        .insert([payload]);

      if (dbError) {
        console.warn('Fallback localStorage:', dbError);
        const existing = JSON.parse(localStorage.getItem('dino_doces_custom_orders') || '[]');
        payload.id = 'enc-' + Date.now();
        localStorage.setItem('dino_doces_custom_orders', JSON.stringify([payload, ...existing]));
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro ao enviar sua encomenda. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Tela de Sucesso ── */
  if (success) {
    return (
      <div className="container section-padding">
        <div className="empty-state-card custom-success-card">
          <div className="empty-state-icon custom-success-icon">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="empty-state-title custom-success-title">
            Recebemos seu pedido com sucesso!
          </h2>
          <p className="empty-state-text custom-success-subtitle">
            Seu pedido já foi registrado e está sendo preparado com muito carinho.
          </p>
          <p className="custom-success-desc">
            Nossa equipe da DINO DOCES irá cuidar de todos os detalhes da sua encomenda.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/meus-pedidos" className="btn btn-primary">Acompanhar meus pedidos</Link>
            <Link to="/" className="btn btn-secondary">Voltar ao Início</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render dos Painéis de Bolos ── */
  const renderBoloPanel = (idx) => {
    if (activeBoloCard !== idx) return null;

    if (idx === 0) return (
      <div className="cp-panel">
        <div>
          <p className="cp-panel-label">Escolha a massa</p>
          <OptionsWrap>
            {MASSAS_BOLO.map(m => (
              <OptionBtn key={m} selected={massaBolo === m} onClick={() => setMassaBolo(m)}>{m}</OptionBtn>
            ))}
          </OptionsWrap>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <p className="cp-panel-label">Escolha o recheio</p>
          <OptionsWrap>
            {RECHEIOS_BOLO.map(r => (
              <OptionBtn key={r} selected={recheioBolo === r} onClick={() => setRecheioBolo(r)}>{r}</OptionBtn>
            ))}
          </OptionsWrap>
        </div>
      </div>
    );

    if (idx === 1) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o recheio</p>
        <OptionsWrap>
          {RECHEIOS_BOLO.map(r => (
            <OptionBtn key={r} selected={recheioBolo === r} onClick={() => setRecheioBolo(r)}>{r}</OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 2) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Adicionar frutas (pode selecionar várias)</p>
        <OptionsWrap>
          {FRUTAS_BOLO.map(f => (
            <OptionBtn key={f} selected={frutasBolo.includes(f)} onClick={() => toggleFrutaBolo(f)}>{f}</OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 3) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Conte o que você gostaria de encomendar</p>
        <textarea
          className="form-input"
          rows={4}
          placeholder="Ex.: Quero um bolo de chocolate com brigadeiro de leite e morango..."
          value={descBoloCustom}
          onChange={e => setDescBoloCustom(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
    );

    if (idx === 4) return (
      <div className="cp-panel">
        <div>
          <p className="cp-panel-label">Tamanho</p>
          <OptionsWrap>
            {TAMANHOS_BOLO.map(t => (
              <OptionBtn
                key={t.label}
                selected={tamanhoBolo?.label === t.label}
                onClick={() => setTamanhoBolo(t)}
              >
                {t.label} — R$ {t.preco}
              </OptionBtn>
            ))}
          </OptionsWrap>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <p className="cp-panel-label">Intensidade do doce</p>
          <OptionsWrap>
            {INTENSIDADES_BOLO.map(i => (
              <OptionBtn key={i} selected={intensidadeBolo === i} onClick={() => setIntensidadeBolo(i)}>{i}</OptionBtn>
            ))}
          </OptionsWrap>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <p className="cp-panel-label">Ponto de calda</p>
          <OptionsWrap>
            {CALDAS_BOLO.map(c => (
              <OptionBtn key={c} selected={caldaBolo === c} onClick={() => setCaldaBolo(c)}>{c}</OptionBtn>
            ))}
          </OptionsWrap>
        </div>
      </div>
    );

    if (idx === 5) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o tipo de encomenda especial</p>
        <OptionsWrap>
          {ENCOMENDAS_BOLO.map(e => (
            <OptionBtn key={e} selected={encomendaBolo === e} onClick={() => setEncomendaBolo(e)}>{e}</OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    return null;
  };

  /* ── Render dos Painéis de Açaí ── */
  const renderAcaiPanel = (idx) => {
    if (activeAcaiCard !== idx) return null;

    if (idx === 0) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o tamanho do Açaí</p>
        <OptionsWrap>
          {TAMANHOS_ACAI.map(t => (
            <OptionBtn key={t.label} selected={tamanhoAcai?.label === t.label} onClick={() => setTamanhoAcai(t)}>
              {t.label} — R$ {t.preco}
            </OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 1) return (
      <div className="cp-panel">
        <p className="cp-panel-label">
          Escolha sua fruta (1 fruta inclusa • Fruta adicional + R$ 2 cada)
        </p>
        <OptionsWrap>
          {FRUTAS_ACAI.map(f => (
            <OptionBtn key={f} selected={frutasAcai.includes(f)} onClick={() => toggleFrutaAcai(f)}>
              {f} {frutasAcai.filter(x => x !== 'Nenhuma').length > 1 && frutasAcai.includes(f) && frutasAcai[0] !== f ? '(+R$ 2)' : ''}
            </OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 2) return (
      <div className="cp-panel">
        <div>
          <p className="cp-panel-label">Escolha a calda (1 inclusa)</p>
          <OptionsWrap>
            {CALDAS_ACAI.map(c => (
              <OptionBtn key={c} selected={caldaAcai === c} onClick={() => setCaldaAcai(c)}>{c}</OptionBtn>
            ))}
          </OptionsWrap>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <p className="cp-panel-label">
            Escolha os complementos (1 incluso • Complemento adicional + R$ 2 cada)
          </p>
          <OptionsWrap>
            {COMPLEMENTOS_ACAI.map(comp => (
              <OptionBtn key={comp} selected={complementosAcai.includes(comp)} onClick={() => toggleComplementoAcai(comp)}>
                {comp} {complementosAcai.length > 1 && complementosAcai.includes(comp) && complementosAcai[0] !== comp ? '(+R$ 2)' : ''}
              </OptionBtn>
            ))}
          </OptionsWrap>
        </div>
      </div>
    );

    return null;
  };

  /* ── Render dos Painéis de Batidas ── */
  const renderBatidaPanel = (idx) => {
    if (activeBatidaCard !== idx) return null;

    if (idx === 0) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o tamanho da Batida</p>
        <OptionsWrap>
          {TAMANHOS_BATIDA.map(t => (
            <OptionBtn key={t.label} selected={tamanhoBatida?.label === t.label} onClick={() => setTamanhoBatida(t)}>
              {t.label} — R$ {t.preco}
            </OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 1) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o sabor da Batida</p>
        <OptionsWrap>
          {SABORES_BATIDA.map(s => (
            <OptionBtn key={s} selected={saborBatida === s} onClick={() => setSaborBatida(s)}>{s}</OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    if (idx === 2) return (
      <div className="cp-panel">
        <p className="cp-panel-label">Escolha o acompanhamento</p>
        <OptionsWrap>
          {ACOMPANHAMENTOS_BATIDA.map(a => (
            <OptionBtn key={a} selected={acompBatida === a} onClick={() => setAcompBatida(a)}>{a}</OptionBtn>
          ))}
        </OptionsWrap>
      </div>
    );

    return null;
  };

  return (
    <div>
      {/* Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="page-header-tag">
            <Sparkles size={16} />
            <span>Faça seu pedido sob medida</span>
          </div>
          <h1 className="section-title">Pedido Personalizado</h1>
          <p className="section-subtitle">
            Escolha bolos, açaí ou batidas, combine sabores e monte o pedido perfeito.
          </p>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '0' }}>

        {/* ── 1. CATEGORIAS PRINCIPAIS (3 Botões Grandes) ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', color: 'var(--chocolate-brown)', marginBottom: '1.25rem' }}>
            Escolha uma categoria para personalizar
          </h2>

          <div className="cp-categories-grid">
            {CATEGORIAS.map(cat => {
              const isSelected = categoriaAtual === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaAtual(cat.id)}
                  className={`cp-category-btn${isSelected ? ' active' : ''}`}
                >
                  <span className="cp-category-btn-icon">{cat.icon}</span>
                  <span className="cp-category-btn-name">{cat.nome}</span>
                  <span className="cp-category-btn-sub">{cat.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. CARDS DA CATEGORIA ATIVA ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--chocolate-brown)', margin: 0 }}>
              {categoriaAtual === 'bolos' && '🍰 Personalização de Bolos'}
              {categoriaAtual === 'acai' && '🥣 Personalização de Açaí'}
              {categoriaAtual === 'batidas' && '🥤 Personalização de Batidas'}
            </h3>

            {/* Preço dinâmico do item em construção */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Valor deste item:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                {currentItemPrice.label}
              </span>
            </div>
          </div>

          {/* Grid de Cards: Bolos (6 cards) */}
          {categoriaAtual === 'bolos' && (
            <div>
              <div className="custom-ideas-grid">
                {BOLO_CARDS.map((ideia, idx) => {
                  const IconComp = ideia.icon;
                  const isActive = activeBoloCard === idx;
                  return (
                    <div
                      key={idx}
                      className={`custom-idea-card${isActive ? ' cp-card-active' : ''}`}
                      onClick={() => setActiveBoloCard(prev => prev === idx ? null : idx)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="custom-idea-icon">
                        <IconComp size={20} />
                      </div>
                      <h3 className="custom-idea-title">{ideia.title}</h3>
                      <p className="custom-idea-desc">{ideia.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        {isActive
                          ? <ChevronUp size={16} style={{ color: 'var(--primary-green)' }} />
                          : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeBoloCard !== null && renderBoloPanel(activeBoloCard)}
            </div>
          )}

          {/* Grid de Cards: Açaí (3 cards) */}
          {categoriaAtual === 'acai' && (
            <div>
              <div className="custom-ideas-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {ACAI_CARDS.map((ideia, idx) => {
                  const IconComp = ideia.icon;
                  const isActive = activeAcaiCard === idx;
                  return (
                    <div
                      key={idx}
                      className={`custom-idea-card${isActive ? ' cp-card-active' : ''}`}
                      onClick={() => setActiveAcaiCard(prev => prev === idx ? null : idx)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="custom-idea-icon">
                        <IconComp size={20} />
                      </div>
                      <h3 className="custom-idea-title">{ideia.title}</h3>
                      <p className="custom-idea-desc">{ideia.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        {isActive
                          ? <ChevronUp size={16} style={{ color: 'var(--primary-green)' }} />
                          : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeAcaiCard !== null && renderAcaiPanel(activeAcaiCard)}
            </div>
          )}

          {/* Grid de Cards: Batidas (3 cards) */}
          {categoriaAtual === 'batidas' && (
            <div>
              <div className="custom-ideas-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {BATIDA_CARDS.map((ideia, idx) => {
                  const IconComp = ideia.icon;
                  const isActive = activeBatidaCard === idx;
                  return (
                    <div
                      key={idx}
                      className={`custom-idea-card${isActive ? ' cp-card-active' : ''}`}
                      onClick={() => setActiveBatidaCard(prev => prev === idx ? null : idx)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="custom-idea-icon">
                        <IconComp size={20} />
                      </div>
                      <h3 className="custom-idea-title">{ideia.title}</h3>
                      <p className="custom-idea-desc">{ideia.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        {isActive
                          ? <ChevronUp size={16} style={{ color: 'var(--primary-green)' }} />
                          : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeBatidaCard !== null && renderBatidaPanel(activeBatidaCard)}
            </div>
          )}

          {/* Botão para Adicionar o Item Configurado ao Pedido */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAddItemToOrder}
              disabled={!canAddItem}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                opacity: canAddItem ? 1 : 0.6
              }}
            >
              <ShoppingBag size={18} />
              <span>Adicionar ao pedido ({currentItemPrice.label})</span>
            </button>

            {itemAdicionadoMsg && (
              <span style={{ color: 'var(--primary-green)', fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} />
                {itemAdicionadoMsg}
              </span>
            )}
          </div>
        </div>

        {/* ── 3. LISTA DE ITENS ADICIONADOS AO PEDIDO (CARRINHO) ── */}
        <div className="custom-form-card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--chocolate-brown)', margin: 0 }}>
              🛒 Seu pedido ({itensPedido.length} {itensPedido.length === 1 ? 'item' : 'itens'})
            </h3>

            {itensPedido.length > 0 && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Você pode adicionar mais produtos de outras categorias.
              </span>
            )}
          </div>

          {itensPedido.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--cream-surface, #FAFAFA)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <ShoppingBag size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Nenhum item adicionado ainda. Personalize um bolo, açaí ou batida acima e clique em <strong>"Adicionar ao pedido"</strong>.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {itensPedido.map((item, index) => (
                  <div key={item.id} className="cp-cart-item-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--chocolate-brown)' }}>
                          {item.icon} {item.titulo}
                        </span>
                        <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {item.detalhes.map((det, i) => (
                            <li key={i}>{det}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                        {/* Quantidade */}
                        <div className="quantity-picker" style={{ height: '36px' }}>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateItemQty(item.id, -1)}
                            aria-label="Diminuir"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantidade}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateItemQty(item.id, 1)}
                            aria-label="Aumentar"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Subtotal do item */}
                        <span style={{ fontWeight: 700, minWidth: '80px', textAlign: 'right', color: 'var(--primary-green)', fontSize: '1rem' }}>
                          {item.precoUnitario ? `R$ ${(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}` : 'A combinar'}
                        </span>

                        {/* Botão Remover */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="cart-item-remove-btn"
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões do carrinho */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => {
                    // Scroll suave para as categorias
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>+ Adicionar outro item (Trocar categoria)</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Subtotal dos itens:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                    {subtotalGeral ? `R$ ${subtotalGeral.valor.toFixed(2).replace('.', ',')}${subtotalGeral.hasCustom ? ' (+ a combinar)' : ''}` : 'A combinar'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. FORMULÁRIO DE ENTREGA, HORÁRIOS E FINALIZAÇÃO ── */}
        <div className="custom-form-card">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--chocolate-brown)', marginBottom: '1.5rem' }}>
            📋 Dados de Entrega e Finalização
          </h3>

          {error && (
            <div className="alert-message alert-error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>

            {/* ── Forma de Recebimento ── */}
            <div className="cp-section">
              <p className="cp-section-title">🚚 Forma de recebimento</p>
              <div className="cp-options-wrap" style={{ marginBottom: '1rem' }}>
                {[
                  { value: 'Entrega',  label: '🏠 Entrega' },
                  { value: 'Retirada', label: '🛍️ Retirada' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForma(opt.value)}
                    className={`cp-option-btn${formaRecebimento === opt.value ? ' selected' : ''}`}
                    style={{ fontSize: '0.95rem', padding: '0.65rem 1.5rem' }}
                  >
                    {formaRecebimento === opt.value && <CheckCircle2 size={14} />}
                    {opt.label}
                  </button>
                ))}
              </div>

              {formaRecebimento === 'Entrega' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Endereço de entrega</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Digite seu endereço completo"
                      value={endereco}
                      onChange={e => setEndereco(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cp-delivery-fee-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                        <MapPin size={18} />
                        <span>
                          {distanciaKm !== null
                            ? `Distância calculada: ~${distanciaKm} km`
                            : 'Informe seu endereço para calcular a taxa'}
                        </span>
                      </div>
                      <span className="cp-delivery-badge">
                        Taxa: {deliveryInfo.label}
                      </span>
                    </div>

                    <div className="cp-delivery-tiers-list">
                      <span className={distanciaKm !== null && distanciaKm <= 2 ? 'tier-active' : ''}>• Até 2 km: R$ 5</span>
                      <span className={distanciaKm !== null && distanciaKm > 2 && distanciaKm <= 5 ? 'tier-active' : ''}>• Mais de 2 até 5 km: R$ 8</span>
                      <span className={distanciaKm !== null && distanciaKm > 5 && distanciaKm <= 10 ? 'tier-active' : ''}>• Mais de 5 até 10 km: R$ 12</span>
                      <span className={distanciaKm !== null && distanciaKm > 10 ? 'tier-active' : ''}>• Acima de 10 km: A combinar</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Horários de Entrega ── */}
            <div className="cp-section">
              <div className="cp-schedule-info-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                  <Clock size={18} />
                  <span>Horários de entrega</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <li><strong>Segunda a sexta-feira:</strong> entregas a partir das <strong>18h</strong>.</li>
                  <li><strong>Sábados e domingos:</strong> entregas em <strong>qualquer horário</strong>, mediante disponibilidade.</li>
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">📅 Data desejada</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataDesejada}
                    onChange={e => setData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {dataDesejada && (
                    <p style={{ fontSize: '0.8rem', color: isWeekdaySelected ? 'var(--primary-green)' : 'var(--chocolate-brown)', marginTop: '0.3rem', fontWeight: 500 }}>
                      {isWeekdaySelected ? '🗓️ Dia de semana (Entregas a partir das 18h)' : '🎉 Fim de semana (Qualquer horário)'}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">🕐 Horário desejado</label>
                  <input
                    type="time"
                    className={`form-input${isTimeInvalid ? ' input-warning' : ''}`}
                    value={horarioDesejado}
                    onChange={e => setHorario(e.target.value)}
                    min={isWeekdaySelected && formaRecebimento === 'Entrega' ? '18:00' : undefined}
                    required
                  />
                  {isTimeInvalid && (
                    <p style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '0.3rem', fontWeight: 600 }}>
                      ⚠️ De segunda a sexta-feira, entregas são a partir das 18h.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Dados do Cliente ── */}
            <div className="cp-section">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome do cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Observações adicionais (Opcional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Detalhes para entrega, troco, embalagens especiais ou observações..."
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* ── Resumo Final dos Valores ── */}
            <div className="cp-valor-box">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--chocolate-brown)', margin: '0 0 0.5rem 0' }}>
                💳 Resumo do pedido
              </h3>

              <div className="cp-valor-row">
                <span>Subtotal dos itens ({itensPedido.reduce((acc, cur) => acc + cur.quantidade, 0)} itens)</span>
                <span>
                  {subtotalGeral ? `R$ ${subtotalGeral.valor.toFixed(2).replace('.', ',')}${subtotalGeral.hasCustom ? ' (+ a combinar)' : ''}` : 'A combinar'}
                </span>
              </div>

              <div className="cp-valor-row">
                <span>Taxa de entrega</span>
                <span style={{ fontWeight: 600 }}>
                  {deliveryInfo.label}
                </span>
              </div>

              <div className="cp-valor-row cp-valor-total">
                <span>Total</span>
                <span>{totalGeralLabel}</span>
              </div>
            </div>

            {/* ── Botão Finalizar / Enviar ── */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || isTimeInvalid || (itensPedido.length === 0 && !canAddItem)}
              style={{ marginTop: '1.25rem', fontSize: '1.05rem', padding: '1rem 1.75rem' }}
            >
              {loading ? (
                <span>Enviando pedido...</span>
              ) : (
                <>
                  <span>ENVIAR PEDIDO</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {!user && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Você será direcionado para entrar na sua conta ao enviar o pedido.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


