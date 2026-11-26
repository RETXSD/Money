/**
 * Splits an integer-rupiah bill evenly or validates custom participant shares.
 * @param {{ total: number, participants: Array<{ id?: string, personId?: string|null, name?: string, isMe?: boolean, amount?: number }>, mode: 'equal'|'custom' }} input
 * @returns {Array<object>} Participants with an integer `share` field.
 */
export function splitBill({ total, participants, mode }) {
  if (!Number.isSafeInteger(total) || total <= 0) {
    throw new RangeError('Total harus berupa rupiah bulat yang lebih dari nol.');
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new RangeError('Pilih setidaknya satu peserta.');
  }

  if (mode === 'equal') {
    const quotient = Math.floor(total / participants.length);
    const remainder = total % participants.length;
    return participants.map((participant, index) => ({
      ...participant,
      share: quotient + (index < remainder ? 1 : 0),
    }));
  }

  if (mode !== 'custom') throw new RangeError('Mode patungan tidak dikenal.');
  const customTotal = participants.reduce((sum, participant) => {
    if (!Number.isSafeInteger(participant.amount) || participant.amount < 0) {
      throw new RangeError('Bagian setiap peserta harus berupa rupiah bulat.');
    }
    return sum + participant.amount;
  }, 0);
  if (customTotal !== total) throw new RangeError('Jumlah bagian harus sama dengan total tagihan.');
  return participants.map((participant) => ({ ...participant, share: participant.amount }));
}
