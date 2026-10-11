export function formatCurrency(amount: number, symbol = 'COP'): string {
  const num = amount || 0;
  const isWhole = Number.isInteger(num);
  const formatted = num.toLocaleString('es-CO', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (symbol === 'COP' || symbol === '$ COP' || symbol === '$') {
    return `$${formatted} COP`;
  }
  return `${symbol} ${formatted} COP`;
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTicketCode(num: number): string {
  return `T-${String(num).padStart(5, '0')}`;
}
