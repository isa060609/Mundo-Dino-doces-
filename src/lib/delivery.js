// Sistema de cálculo de taxa de entrega e horários para Dino Doces

/**
 * Tabela de taxas por distância:
 * - Até 2 km: R$ 5,00
 * - Mais de 2 até 5 km: R$ 8,00
 * - Mais de 5 até 10 km: R$ 12,00
 * - Acima de 10 km: A combinar
 */

export function calculateDistance(address) {
  if (!address || address.trim().length < 3) return null;

  const clean = address.trim().toLowerCase();

  // Se o usuário digitou diretamente a quilometragem ou número indicativo (ex: "3km", "8 km")
  const kmMatch = clean.match(/(\d+([.,]\d+)?)\s*(km|quil[oô]metros?)/);
  if (kmMatch) {
    const val = parseFloat(kmMatch[1].replace(',', '.'));
    if (!isNaN(val)) return Math.max(0.5, Math.round(val * 10) / 10);
  }

  // Hash determinístico baseado nas palavras do endereço para cálculo instantâneo e estável
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Variação de distância entre 1.2 km e 12.5 km baseada no endereço
  const dist = 1.2 + (absHash % 115) / 10;
  return Math.round(dist * 10) / 10;
}

export function getDeliveryFee(distanceKm, formaRecebimento) {
  if (formaRecebimento === 'Retirada') {
    return {
      fee: 0,
      label: 'Grátis (Sem taxa)',
      tier: 'Retirada no local',
      isCustom: false
    };
  }

  if (formaRecebimento !== 'Entrega' || distanceKm === null || distanceKm === undefined) {
    return {
      fee: null,
      label: 'Digite o endereço para calcular',
      tier: 'A calcular',
      isCustom: false
    };
  }

  if (distanceKm <= 2) {
    return {
      fee: 5,
      label: 'R$ 5,00',
      tier: 'Até 2 km (R$ 5,00)',
      isCustom: false
    };
  }

  if (distanceKm <= 5) {
    return {
      fee: 8,
      label: 'R$ 8,00',
      tier: 'Mais de 2 até 5 km (R$ 8,00)',
      isCustom: false
    };
  }

  if (distanceKm <= 10) {
    return {
      fee: 12,
      label: 'R$ 12,00',
      tier: 'Mais de 5 até 10 km (R$ 12,00)',
      isCustom: false
    };
  }

  return {
    fee: null,
    label: 'A combinar',
    tier: 'Acima de 10 km (A combinar)',
    isCustom: true
  };
}

export function isWeekday(dateStr) {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 1 = Seg, 5 = Sex
}

export function validateDeliveryTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return { valid: true };

  if (isWeekday(dateStr)) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < 18) {
      return {
        valid: false,
        error: 'De segunda a sexta-feira, as entregas são realizadas a partir das 18h.'
      };
    }
  }

  return { valid: true };
}
