const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCurrency(amount: number) {
  return `ETB ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatCompactCurrency(amount: number) {
  if (amount >= 1000000) return `ETB ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `ETB ${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function toInputDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(date: Date) {
  return months[date.getMonth()];
}
