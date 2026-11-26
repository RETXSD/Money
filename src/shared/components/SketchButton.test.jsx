import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link, MemoryRouter } from 'react-router-dom';
import { SketchButton } from './SketchButton.jsx';

describe('SketchButton', () => {
  it('renders its label and supports the disabled state', () => {
    render(<SketchButton disabled>Tambah catatan</SketchButton>);

    expect(screen.getByRole('button', { name: 'Tambah catatan' })).toBeDisabled();
  });

  it('renders as a navigational link without nesting an interactive element', () => {
    render(
      <MemoryRouter>
        <SketchButton as={Link} to="/budgets">
          Lihat anggaran
        </SketchButton>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Lihat anggaran' })).toHaveAttribute(
      'href',
      '/budgets',
    );
  });
});
