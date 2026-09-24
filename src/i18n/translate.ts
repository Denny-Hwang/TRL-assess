/**
 * Message formatting shared by the UI and the exports. Pure functions — no React.
 *
 * Messages use `{name}` placeholders. Messages avoid plural forms — "Rated: {count} of {total}"
 * rather than "1 dimension / 2 dimensions" — so every language has exactly the English keys.
 */
import type { Lang } from './languages';
import { en, type MessageKey } from './en';

export type Messages = Record<MessageKey, string>;
export type Params = Record<string, string | number>;

export function format(template: string, params: Params = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  );
}

/**
 * Unofficial translations of source content (criteria, questions, rubric text, framework
 * descriptions), keyed by the exact English text. The English stays authoritative and is always
 * shown; a translation is displayed beside it, in parentheses, for reference only.
 */
export type SourceTranslations = Record<string, string>;

export interface Translator {
  lang: Lang;
  messages: Messages;
  t: (key: MessageKey, params?: Params) => string;
  /** The translation of a piece of English source text, or undefined (always, in English). */
  st: (english: string | undefined) => string | undefined;
}

export function createTranslator(
  lang: Lang,
  messages: Messages,
  source: SourceTranslations = {},
): Translator {
  const lookup = (key: string): string =>
    (messages as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  return {
    lang,
    messages,
    t: (key, params) => format(lookup(key), params),
    st: (english) => {
      if (lang === 'en' || !english) return undefined;
      const translated = source[english.trim()];
      return translated && translated !== english ? translated : undefined;
    },
  };
}

/** The English translator — the default for exports and for code that runs outside React. */
export const EN: Translator = createTranslator('en', en);
