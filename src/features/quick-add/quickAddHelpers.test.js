import { describe, expect, it } from 'vitest';
import { getKeywordSuggestion } from './quickAddHelpers.js';

const categories = [
  { id: 'food', keywords: ['makan', 'nasi'] },
  { id: 'fun', keywords: ['hiburan'] },
];

describe('getKeywordSuggestion', () => {
  it('suggests a useful word when the user changes the matched category', () => {
    expect(getKeywordSuggestion('beli kopi susu', categories, 'fun', 'food')).toBe('kopi');
  });

  it('does not suggest a word when the category did not change', () => {
    expect(getKeywordSuggestion('beli kopi', categories, 'food', 'food')).toBe('');
  });

  it('skips stop words and words already in the selected category', () => {
    expect(getKeywordSuggestion('beli hiburan kopi', categories, 'fun', 'food')).toBe('kopi');
  });
});
