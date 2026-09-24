/**
 * The interface language. English ships in the entry chunk; every other catalog is loaded on
 * demand. The choice is remembered per browser (localStorage), never sent anywhere.
 */
import { create } from 'zustand';
import { STORAGE_KEY_UI } from '@/config/app.config';
import { DEFAULT_LANG, directionOf, isLang, type Lang } from './languages';
import {
  createTranslator,
  EN,
  type Messages,
  type SourceTranslations,
  type Translator,
} from './translate';

const LOADERS: Record<Exclude<Lang, 'en'>, () => Promise<Messages>> = {
  ko: () => import('./ko').then((m) => m.ko),
  zh: () => import('./zh').then((m) => m.zh),
  ja: () => import('./ja').then((m) => m.ja),
  es: () => import('./es').then((m) => m.es),
  de: () => import('./de').then((m) => m.de),
  hi: () => import('./hi').then((m) => m.hi),
  ar: () => import('./ar').then((m) => m.ar),
};

const SOURCE_LOADERS: Record<Exclude<Lang, 'en'>, () => Promise<SourceTranslations>> = {
  ko: () => import('./source/ko.json').then((m) => m.default),
  zh: () => import('./source/zh.json').then((m) => m.default),
  ja: () => import('./source/ja.json').then((m) => m.default),
  es: () => import('./source/es.json').then((m) => m.default),
  de: () => import('./source/de.json').then((m) => m.default),
  hi: () => import('./source/hi.json').then((m) => m.default),
  ar: () => import('./source/ar.json').then((m) => m.default),
};

export async function loadMessages(lang: Lang): Promise<Messages> {
  return lang === 'en' ? EN.messages : LOADERS[lang]();
}

/** Reference translations of source content; empty for English. */
export async function loadSourceTranslations(lang: Lang): Promise<SourceTranslations> {
  return lang === 'en' ? {} : SOURCE_LOADERS[lang]();
}

function storedLang(): Lang {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY_UI);
    const lang = raw ? (JSON.parse(raw) as { lang?: unknown }).lang : undefined;
    return isLang(lang) ? lang : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function remember(lang: Lang): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY_UI, JSON.stringify({ lang }));
  } catch {
    /* storage unavailable — the choice lasts for this page only */
  }
}

function applyToDocument(lang: Lang): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = directionOf(lang);
}

interface LangState {
  translator: Translator;
  setLang: (lang: Lang) => Promise<void>;
}

export const useLangStore = create<LangState>((set) => ({
  translator: EN,
  setLang: async (lang) => {
    const [messages, source] = await Promise.all([
      loadMessages(lang),
      loadSourceTranslations(lang),
    ]);
    remember(lang);
    applyToDocument(lang);
    set({ translator: createTranslator(lang, messages, source) });
  },
}));

/** Restores the remembered language at start-up (English until its catalog has loaded). */
export function initLanguage(): void {
  const lang = storedLang();
  applyToDocument(DEFAULT_LANG);
  if (lang !== DEFAULT_LANG) void useLangStore.getState().setLang(lang);
}

/** `const { t, lang } = useT();` */
export function useT(): Translator {
  return useLangStore((s) => s.translator);
}
