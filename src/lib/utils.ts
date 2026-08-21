// Utility helper functions

export function formatPrice(amount: number | string): string {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof parsed !== 'number' || isNaN(parsed)) return '₹0';
  return `₹${parsed.toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getLanguageDisplay(code: string): string {
  const map: Record<string, string> = {
    en: 'English',
    te: 'Telugu',
    hi: 'Hindi',
  };
  return map[code] || code;
}

export function getLanguageBadgeClass(code: string): string {
  const map: Record<string, string> = {
    en: 'badge-blue',
    te: 'badge-gold',
    hi: 'badge-neutral',
  };
  return map[code] || 'badge-neutral';
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidMobile(mobile: string): boolean {
  if (!mobile || typeof mobile !== 'string') return false;
  return /^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ''));
}

export function isValidPinCode(pin: string): boolean {
  if (!pin || typeof pin !== 'string') return false;
  return /^\d{6}$/.test(pin.trim());
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TEP-${timestamp}-${random}`;
}

export function truncateText(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trim() + '...';
}
