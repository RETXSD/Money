import { QUICK_ADD_NOTE_STOP_WORDS } from '../../shared/constants/quickAdd.js';

/** Suggests one useful note word when the user picks a different category. */
export function getKeywordSuggestion(note, categories, categoryId, parsedCategoryId) {
  if (!categoryId || categoryId === parsedCategoryId) return '';
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return '';

  const stopWords = new Set(QUICK_ADD_NOTE_STOP_WORDS);
  const currentKeywords = new Set((category.keywords || []).map(normalizeKeyword));
  const words =
    String(note || '')
      .toLocaleLowerCase('id-ID')
      .match(/[\p{L}\p{N}]+/gu) || [];
  return (
    words.find((word) => word.length > 2 && !stopWords.has(word) && !currentKeywords.has(word)) ||
    ''
  );
}

function normalizeKeyword(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('id-ID');
}
