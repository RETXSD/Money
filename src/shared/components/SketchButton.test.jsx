import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SketchButton } from './SketchButton.jsx';

describe('SketchButton', () => {
  it('renders its label and supports the disabled state', () => {
    render(<SketchButton disabled>Tambah catatan</SketchButton>);

    expect(screen.getByRole('button', { name: 'Tambah catatan' })).toBeDisabled();
  });
});
