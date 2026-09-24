import { LANGUAGES, type Lang } from '@/i18n/languages';
import { useLangStore, useT } from '@/i18n/store';

/** The interface language. Criteria and rubric text stay in the language of their sources. */
export function LanguageSelect() {
  const { t, lang } = useT();
  const setLang = useLangStore((s) => s.setLang);
  return (
    <label className="ms-auto inline-flex items-center gap-2 text-sm text-slate-600">
      <span aria-hidden="true">🌐</span>
      <span className="sr-only">{t('lang.label')}</span>
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        value={lang}
        onChange={(e) => void setLang(e.target.value as Lang)}
        data-testid="language-select"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
