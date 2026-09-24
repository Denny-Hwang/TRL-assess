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

export interface Translator {
  lang: Lang;
  messages: Messages;
  t: (key: MessageKey, params?: Params) => string;
}

export function createTranslator(lang: Lang, messages: Messages): Translator {
  const lookup = (key: string): string =>
    (messages as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  return {
    lang,
    messages,
    t: (key, params) => format(lookup(key), params),
  };
}

/** The English translator — the default for exports and for code that runs outside React. */
export const EN: Translator = createTranslator('en', en);
