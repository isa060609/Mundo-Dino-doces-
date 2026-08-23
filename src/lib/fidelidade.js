import { supabase } from './supabase';

export const MAX_PONTOS = 10;
export const ITENS_POR_PONTO = 2;

export const RECOMPENSAS_DISPONIVEIS = [
  {
    id: 'r5_off',
    titulo: 'R$ 5 OFF',
    badge: '💰 Desconto Direto',
    icone: '💰',
    regra: 'Válido em compras acima de R$ 20,00',
    descricao: 'Desconto imperdível de R$ 5,00 em qualquer pedido do cardápio.',
    prefixoCodigo: 'DINO5OFF'
  },
  {
    id: 'adicional_r2_off',
    titulo: '1 Adicional Grátis + R$ 2 OFF',
    badge: '🍫 Combo Especial',
    icone: '🍫',
    regra: 'Válido em compras acima de R$ 20,00',
    descricao: '1 adicional saboroso grátis à sua escolha + R$ 2,00 de desconto no pedido.',
    prefixoCodigo: 'DINOADIC'
  }
];

// E-mails autorizados como Administrador / Lojista da Dino Doces (Apenas estes 2)
export const ADMIN_EMAILS = [
  'isabellaribeiro418@gmail.com',
  'pedrohenrique929@icloud.com'
];

/**
 * Verifica se o usuário atual possui permissão de Administrador
 * Restrito estritamente aos 2 e-mails cadastrados.
 */
export function isUserAdmin(user, profile) {
  if (!user && !profile) return false;
  const userEmail = (user?.email || profile?.email || '').toLowerCase().trim();

  return ADMIN_EMAILS.includes(userEmail);
}

// Helper para chaves do LocalStorage
const STORAGE_KEYS = {
  CARDS: 'dino_doces_loyalty_cards',
  REDEMPTIONS: 'dino_doces_loyalty_redemptions',
  HISTORY: 'dino_doces_loyalty_history'
};

function getLocalData(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalData(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage:', e);
  }
}

/**
 * Retorna os dados do Cartão Fidelidade do cliente
 */
export async function getCartaoFidelidade(clienteId) {
  if (!clienteId) return null;

  try {
    const { data, error } = await supabase
      .from('cartao_fidelidade')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    if (!error && data) {
      // Atualizar cache local
      const cards = getLocalData(STORAGE_KEYS.CARDS, {});
      cards[clienteId] = data;
      setLocalData(STORAGE_KEYS.CARDS, cards);
      return data;
    }
  } catch (err) {
    console.warn('Supabase offline/sem tabela cartao_fidelidade, buscando local:', err);
  }

  // Fallback Local
  const cards = getLocalData(STORAGE_KEYS.CARDS, {});
  if (cards[clienteId]) {
    return cards[clienteId];
  }

  // Cria cartão inicial se não existir
  const initialCard = {
    cliente_id: clienteId,
    pontos: 0,
    itens_acumulados: 0,
    total_resgates: 0,
    atualizado_em: new Date().toISOString()
  };

  cards[clienteId] = initialCard;
  setLocalData(STORAGE_KEYS.CARDS, cards);
  return initialCard;
}

/**
 * Retorna as recompensas já resgatadas pelo cliente
 */
export async function getHistoricoResgates(clienteId) {
  if (!clienteId) return [];

  try {
    const { data, error } = await supabase
      .from('recompensas_resgatadas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('resgatado_em', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase offline para recompensas, usando local:', err);
  }

  const allRedemptions = getLocalData(STORAGE_KEYS.REDEMPTIONS, []);
  return allRedemptions.filter(r => r.cliente_id === clienteId);
}

/**
 * Retorna o histórico de transações de pontos do cliente
 */
export async function getHistoricoPontos(clienteId) {
  if (!clienteId) return [];

  try {
    const { data, error } = await supabase
      .from('historico_fidelidade')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase offline para histórico, usando local:', err);
  }

  const allHistory = getLocalData(STORAGE_KEYS.HISTORY, []);
  return allHistory.filter(h => h.cliente_id === clienteId);
}

/**
 * Resgata uma recompensa quando o cliente atinge 10 pontos
 */
export async function resgatarRecompensa(clienteId, recompensaId) {
  if (!clienteId) throw new Error('Cliente não identificado.');

  const card = await getCartaoFidelidade(clienteId);
  if (!card || card.pontos < MAX_PONTOS) {
    throw new Error('Você precisa acumular 10 pontos para resgatar uma recompensa.');
  }

  const recompensa = RECOMPENSAS_DISPONIVEIS.find(r => r.id === recompensaId);
  if (!recompensa) {
    throw new Error('Recompensa inválida.');
  }

  // Gera código único do voucher (ex: DINO5OFF-7X9K)
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const voucherCode = `${recompensa.prefixoCodigo}-${randomHex}`;

  const redemptionRecord = {
    id: 'resgate-' + Date.now(),
    cliente_id: clienteId,
    recompensa_id: recompensa.id,
    titulo: recompensa.titulo,
    descricao: `${recompensa.regra} — ${recompensa.descricao}`,
    codigo_voucher: voucherCode,
    status: 'disponivel',
    resgatado_em: new Date().toISOString()
  };

  const historyRecord = {
    id: 'hist-' + Date.now(),
    cliente_id: clienteId,
    tipo: 'resgate_recompensa',
    itens_comprados: 0,
    pontos_alterados: -MAX_PONTOS,
    descricao: `Resgate de recompensa: ${recompensa.titulo} (Código: ${voucherCode})`,
    criado_em: new Date().toISOString()
  };

  // Novo estado do cartão: pontos voltam para 0, itens acumulados continuam os mesmos
  const updatedCard = {
    ...card,
    pontos: 0,
    total_resgates: (card.total_resgates || 0) + 1,
    atualizado_em: new Date().toISOString()
  };

  // Salvar no Supabase
  try {
    await supabase.from('recompensas_resgatadas').insert([redemptionRecord]);
    await supabase.from('historico_fidelidade').insert([historyRecord]);
    await supabase.from('cartao_fidelidade').upsert(updatedCard);
  } catch (err) {
    console.warn('Erro ao sincronizar resgate no Supabase, salvando local:', err);
  }

  // Salvar no LocalStorage
  const cards = getLocalData(STORAGE_KEYS.CARDS, {});
  cards[clienteId] = updatedCard;
  setLocalData(STORAGE_KEYS.CARDS, cards);

  const redemptions = getLocalData(STORAGE_KEYS.REDEMPTIONS, []);
  setLocalData(STORAGE_KEYS.REDEMPTIONS, [redemptionRecord, ...redemptions]);

  const history = getLocalData(STORAGE_KEYS.HISTORY, []);
  setLocalData(STORAGE_KEYS.HISTORY, [historyRecord, ...history]);

  return {
    card: updatedCard,
    voucher: redemptionRecord
  };
}

/**
 * Função executada pelo Administrador para lançar itens comprados para um cliente
 * Regras:
 * - 2 itens = 1 ponto
 * - Se ímpar, sobra 1 item acumulado para a próxima
 * - Se o cartão estiver em 10/10, o cliente NÃO ganha mais pontos
 */
export async function adicionarCompraAdmin(clienteId, qtdItens, observacao = '') {
  if (!clienteId) throw new Error('Selecione um cliente.');
  const itens = parseInt(qtdItens, 10);
  if (isNaN(itens) || itens <= 0) {
    throw new Error('A quantidade de itens deve ser maior que zero.');
  }

  const card = await getCartaoFidelidade(clienteId);
  const pontosAtuais = card.pontos || 0;
  const itensAcumuladosAtuais = card.itens_acumulados || 0;

  if (pontosAtuais >= MAX_PONTOS) {
    throw new Error('O cliente já atingiu 10/10 pontos! O cartão está bloqueado aguardando o resgate do prêmio.');
  }

  const totalItensConsiderados = itensAcumuladosAtuais + itens;
  const pontosGanhos = Math.floor(totalItensConsiderados / ITENS_POR_PONTO);
  const novosItensAcumulados = totalItensConsiderados % ITENS_POR_PONTO;

  const novosPontos = Math.min(MAX_PONTOS, pontosAtuais + pontosGanhos);
  const pontosEfetivosAdicionados = novosPontos - pontosAtuais;

  const updatedCard = {
    ...card,
    cliente_id: clienteId,
    pontos: novosPontos,
    itens_acumulados: novosPontos >= MAX_PONTOS ? 0 : novosItensAcumulados,
    atualizado_em: new Date().toISOString()
  };

  const desc = `Compra de ${itens} item(ns)${observacao ? ` (${observacao})` : ''} ➔ +${pontosEfetivosAdicionados} ponto(s) | ${updatedCard.itens_acumulados} item acumulado`;

  const historyRecord = {
    id: 'hist-' + Date.now(),
    cliente_id: clienteId,
    tipo: 'compra_itens',
    itens_comprados: itens,
    pontos_alterados: pontosEfetivosAdicionados,
    descricao: desc,
    criado_em: new Date().toISOString()
  };

  // Salvar no Supabase
  try {
    await supabase.from('cartao_fidelidade').upsert(updatedCard);
    await supabase.from('historico_fidelidade').insert([historyRecord]);
  } catch (err) {
    console.warn('Erro ao atualizar compra no Supabase:', err);
  }

  // Atualizar LocalStorage
  const cards = getLocalData(STORAGE_KEYS.CARDS, {});
  cards[clienteId] = updatedCard;
  setLocalData(STORAGE_KEYS.CARDS, cards);

  const history = getLocalData(STORAGE_KEYS.HISTORY, []);
  setLocalData(STORAGE_KEYS.HISTORY, [historyRecord, ...history]);

  return {
    card: updatedCard,
    pontosGanhos: pontosEfetivosAdicionados,
    itensAcumulados: updatedCard.itens_acumulados
  };
}
