import { describe, expect, it } from 'vitest';
import { buildDebtWhatsAppUrl } from './whatsapp.js';

describe('buildDebtWhatsAppUrl', () => {
  it('uses a normalized phone and includes amount and due date', () => {
    const url = buildDebtWhatsAppUrl({
      personName: 'Andi',
      phone: '081234567890',
      remaining: 75000,
      dueDate: new Date(2026, 11, 1),
      direction: 'owed_to_me',
    });
    expect(url.startsWith('https://wa.me/6281234567890?text=')).toBe(true);
    const message = decodeURIComponent(url.split('?text=')[1]);
    expect(message).toContain('Rp 75.000');
    expect(message).toContain('1 Desember 2026');
  });

  it('works without a saved phone number', () => {
    const url = buildDebtWhatsAppUrl({
      personName: 'Budi',
      phone: null,
      remaining: 10000,
      dueDate: null,
      direction: 'i_owe',
    });
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
  });
});
