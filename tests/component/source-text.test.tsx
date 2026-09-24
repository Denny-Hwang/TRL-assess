import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { SourceText, withTranslation } from '@/components/ui';
import { useLangStore } from '@/i18n/store';
import { createTranslator, EN } from '@/i18n/translate';
import { en } from '@/i18n/en';

const ko = createTranslator('ko', en, {
  'Laboratory environment': '실험실 환경',
  '(E.g., a note.)': '(예: 메모.)',
});

afterEach(() => act(() => useLangStore.setState({ translator: EN })));

describe('source text with a reference translation', () => {
  it('shows only the English in English', () => {
    render(<SourceText text="Laboratory environment" />);
    expect(screen.getByText('Laboratory environment')).toBeInTheDocument();
    expect(screen.queryByText(/실험실/)).toBeNull();
  });

  it('keeps the English and adds the translation in parentheses in another language', () => {
    act(() => useLangStore.setState({ translator: ko }));
    render(<SourceText text="Laboratory environment" />);
    expect(screen.getByText('Laboratory environment', { exact: false })).toBeInTheDocument();
    const translation = screen.getByText('(실험실 환경)');
    expect(translation).toHaveAttribute('lang', 'ko');
  });

  it('formats plain-text places as "English (translation)"', () => {
    expect(withTranslation(ko, 'Laboratory environment')).toBe(
      'Laboratory environment (실험실 환경)',
    );
    expect(withTranslation(EN, 'Laboratory environment')).toBe('Laboratory environment');
    expect(withTranslation(ko, 'Untranslated')).toBe('Untranslated');
    expect(withTranslation(ko, '(E.g., a note.)')).toBe('(E.g., a note.) (예: 메모.)');
  });
});
