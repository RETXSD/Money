import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SketchModal } from './SketchModal.jsx';

describe('SketchModal', () => {
  it('exposes a named dialog and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <SketchModal onClose={onClose} open title="Catat pengeluaran">
        <button type="button">Simpan</button>
      </SketchModal>,
    );

    expect(screen.getByRole('dialog', { name: 'Catat pengeluaran' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
