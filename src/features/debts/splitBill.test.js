import { describe, expect, it } from 'vitest';
import { splitBill } from './splitBill.js';

describe('splitBill', () => {
  it('distributes remainder rupiah fairly in equal mode', () => {
    const result = splitBill({
      total: 100,
      mode: 'equal',
      participants: [{ isMe: true }, { personId: 'a' }, { personId: 'b' }],
    });
    expect(result.map((participant) => participant.share)).toEqual([34, 33, 33]);
    expect(result.reduce((sum, participant) => sum + participant.share, 0)).toBe(100);
  });

  it('returns custom amounts when their sum matches the bill', () => {
    expect(
      splitBill({
        total: 100000,
        mode: 'custom',
        participants: [
          { isMe: true, amount: 25000 },
          { personId: 'a', amount: 75000 },
        ],
      }).map((participant) => participant.share),
    ).toEqual([25000, 75000]);
  });

  it.each([
    { total: 0, mode: 'equal', participants: [{ isMe: true }] },
    { total: 100, mode: 'equal', participants: [] },
    { total: 100, mode: 'custom', participants: [{ isMe: true, amount: 90 }] },
    { total: 100, mode: 'custom', participants: [{ isMe: true, amount: 100.5 }] },
  ])('rejects invalid split input %#', (input) => {
    expect(() => splitBill(input)).toThrow();
  });
});
