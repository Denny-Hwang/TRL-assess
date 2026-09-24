/**
 * Interface languages: every catalog carries exactly the English keys with the same placeholders,
 * switching language updates the document direction, and the choice is remembered.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { en } from '@/i18n/en';
import { LANGUAGES, directionOf, isLang } from '@/i18n/languages';
import { createTranslator, format, EN } from '@/i18n/translate';
import { loadMessages, loadSourceTranslations, useLangStore, initLanguage } from '@/i18n/store';
import { collectSourceStrings } from '@/i18n/sourceStrings';
import { STORAGE_KEY_UI } from '@/config/app.config';
import { GUIDE_PAGES, hasGuideTranslation, loadGuideBody } from '@/content/guide';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('catalogs', () => {
  it('offers English first, then the seven other languages', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'ko', 'zh', 'ja', 'es', 'de', 'hi', 'ar']);
    expect(directionOf('ar')).toBe('rtl');
    expect(LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code)).toEqual(['ar']);
    expect(isLang('ko')).toBe(true);
    expect(isLang('fr')).toBe(false);
  });

  it.each(LANGUAGES.map((l) => l.code))('%s has every key, no extras, no blanks', async (lang) => {
    const messages = await loadMessages(lang);
    expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
    for (const [key, text] of Object.entries(messages)) {
      expect(text.trim(), `${lang} ${key}`).not.toBe('');
    }
  });

  it.each(LANGUAGES.map((l) => l.code))(
    '%s keeps every placeholder of the English text',
    async (lang) => {
      const messages = (await loadMessages(lang)) as Record<string, string>;
      for (const [key, text] of Object.entries(en)) {
        expect(placeholders(messages[key]!), `${lang} ${key}`).toEqual(placeholders(text));
      }
    },
  );

  it.each(LANGUAGES.filter((l) => l.code !== 'en').map((l) => l.code))(
    '%s is actually translated',
    async (lang) => {
      const messages = (await loadMessages(lang)) as Record<string, string>;
      const same = Object.keys(en).filter(
        (k) => messages[k] === (en as Record<string, string>)[k] && /[a-z]{4,}/i.test(messages[k]!),
      );
      // Short technical terms (TRL, CTE, SHA-256, file names) may legitimately stay as they are.
      expect(
        same.length / Object.keys(en).length,
        `${lang}: ${same.slice(0, 15).join(', ')}`,
      ).toBeLessThan(0.1);
    },
  );
});

describe('translator', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('TRL {level} of {max}', { level: 4, max: 9 })).toBe('TRL 4 of 9');
    expect(format('Hello {who}')).toBe('Hello {who}');
  });

  it('falls back to English for a key a catalog lacks', () => {
    const partial = createTranslator('ko', { ...en, 'nav.home': '홈' });
    expect(partial.t('nav.home')).toBe('홈');
    expect(EN.t('nav.home')).toBe('Home');
  });
});

describe('language store', () => {
  beforeEach(async () => {
    localStorage.clear();
    await useLangStore.getState().setLang('en');
  });

  it('switches language, sets lang and dir on <html>, and remembers the choice', async () => {
    await useLangStore.getState().setLang('ar');
    expect(useLangStore.getState().translator.lang).toBe('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY_UI)!)).toEqual({ lang: 'ar' });

    await useLangStore.getState().setLang('ko');
    expect(document.documentElement.dir).toBe('ltr');
    expect(useLangStore.getState().translator.t('nav.home')).not.toBe('Home');
  });

  it('starts in English and restores a remembered language', async () => {
    localStorage.setItem(STORAGE_KEY_UI, JSON.stringify({ lang: 'de' }));
    initLanguage();
    await new Promise((r) => setTimeout(r, 0));
    await vi.waitFor(() => expect(useLangStore.getState().translator.lang).toBe('de'));
  });

  it('ignores a corrupt or unknown stored language', () => {
    localStorage.setItem(STORAGE_KEY_UI, '{not json');
    initLanguage();
    expect(useLangStore.getState().translator.lang).toBe('en');
    localStorage.setItem(STORAGE_KEY_UI, JSON.stringify({ lang: 'xx' }));
    initLanguage();
    expect(useLangStore.getState().translator.lang).toBe('en');
  });
});

describe('guide translations', () => {
  const figures = (md: string) => [...md.matchAll(/^:::figure ([\w-]+):::$/gm)].map((m) => m[1]);
  const others = LANGUAGES.map((l) => l.code).filter((code) => code !== 'en');

  it.each(others)(
    '%s has every guide page, with the same figures in the same order',
    async (lang) => {
      for (const page of GUIDE_PAGES) {
        expect(hasGuideTranslation(page.slug, lang), `${lang}/${page.slug}`).toBe(true);
        const body = await loadGuideBody(page.slug, lang);
        expect(body, `${lang}/${page.slug}`).toBeTruthy();
        expect(figures(body!), `${lang}/${page.slug}`).toEqual(figures(page.body));
      }
    },
  );
});

describe('source-content translations', () => {
  const english = collectSourceStrings();
  const others = LANGUAGES.map((l) => l.code).filter((code) => code !== 'en');

  it('collects the displayed source text of every framework and the ARL rubric', () => {
    expect(english.length).toBeGreaterThan(250);
    expect(english).toContain('Basic principles observed and reported.');
    expect(english).toContain('Delivered Cost');
  });

  it.each(others)('%s translates every source string, and nothing else', async (lang) => {
    const source = await loadSourceTranslations(lang);
    expect(Object.keys(source).sort()).toEqual(english);
    for (const [en, translated] of Object.entries(source)) {
      expect(translated.trim(), `${lang}: ${en}`).not.toBe('');
      expect(translated.split('\n').length, `${lang} line breaks: ${en}`).toBe(
        en.split('\n').length,
      );
    }
  });

  it('shows no translation in English, and the reference translation in another language', () => {
    expect(EN.st('Delivered Cost')).toBeUndefined();
    const ko = createTranslator('ko', en, { 'Delivered Cost': '공급 비용' });
    expect(ko.st('Delivered Cost')).toBe('공급 비용');
    expect(ko.st('Not in the table')).toBeUndefined();
    expect(ko.st(undefined)).toBeUndefined();
  });
});
