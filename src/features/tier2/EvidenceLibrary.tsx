import { useMemo, useState } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { EvidenceForm } from './EvidenceForm';
import { Callout, SourceText } from '@/components/ui';
import { getBlob } from '@/storage/blobStore';
import { downloadBlob } from '@/export/download';
import { SENSITIVE_MARKING, type EvidenceItem } from '@/domain/schemas';
import { useT } from '@/i18n/store';

interface Props {
  /** When set, the library opens focused on linking evidence to this criterion. */
  focusCriterion?: { cteId: string; criterionId: string } | null;
  onClose?: () => void;
}

export function EvidenceLibrary({ focusCriterion, onClose }: Props) {
  const { t } = useT();
  const session = useSessionStore((s) => s.session);
  const removeEvidence = useSessionStore((s) => s.removeEvidence);
  const linkEvidence = useSessionStore((s) => s.linkEvidence);
  const unlinkEvidence = useSessionStore((s) => s.unlinkEvidence);
  const framework = useSessionStore((s) => s.framework);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('');

  const evidence = useMemo(() => session.tier2?.evidence ?? [], [session.tier2]);
  const criterion = focusCriterion
    ? framework.tier2.find((c) => c.id === focusCriterion.criterionId)
    : undefined;

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return evidence;
    return evidence.filter((e) =>
      [e.id, e.title, e.description, e.type, t(`evidenceType.${e.type}`), e.owner]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [evidence, filter, t]);

  const isLinked = (item: EvidenceItem) =>
    Boolean(
      focusCriterion &&
      item.linkedCriteria.some(
        (l) => l.cteId === focusCriterion.cteId && l.criterionId === focusCriterion.criterionId,
      ),
    );

  const downloadFile = async (item: EvidenceItem) => {
    if (!item.file) return;
    const blob = await getBlob(item.file.blobKey);
    if (blob) downloadBlob(blob, item.file.name);
  };

  return (
    <section aria-label={t('evidence.library.label')} className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('evidence.library.heading')}
        </h2>
        {onClose ? (
          <button type="button" className="text-xs underline" onClick={onClose}>
            {t('evidence.library.close')}
          </button>
        ) : null}
      </header>

      {focusCriterion && criterion ? (
        <Callout tone="info" title={t('evidence.library.linkingTo', { id: criterion.id })}>
          <SourceText text={criterion.text} />
        </Callout>
      ) : null}

      <label className="block text-xs">
        <span className="sr-only">{t('evidence.library.filterLabel')}</span>
        <input
          className="input"
          placeholder={t('evidence.library.filterPlaceholder')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </label>

      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id} className="rounded-md border border-slate-200 bg-white p-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-xs text-slate-500">{item.id}</span>
              <span className="font-medium">{item.title}</span>
              <span className="badge border-slate-300 bg-slate-50 text-slate-600">
                {t(`evidenceType.${item.type}`)}
              </span>
              <span
                className={`badge ${
                  item.marking === SENSITIVE_MARKING
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {t(`marking.${item.marking}`)}
              </span>
              <span
                className={`badge ${
                  item.verification === 'Rejected'
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : item.verification === 'Verified'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {t(`verification.${item.verification}`)}
              </span>
            </div>

            {item.description ? (
              <p className="mt-1 text-xs text-slate-600">{item.description}</p>
            ) : null}

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              {item.url ? (
                <span>
                  <a
                    className="underline"
                    href={item.url}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {t('evidence.library.openLink')}
                  </a>
                </span>
              ) : null}
              {item.repoUrl ? (
                <span className="font-mono">
                  {item.repoUrl}@{item.commitSha?.slice(0, 10)}
                </span>
              ) : null}
              {item.doi ? <span className="font-mono">doi:{item.doi}</span> : null}
              {item.file ? (
                <span>
                  {item.file.name} · {(item.file.sizeBytes / 1024).toFixed(0)} kB ·{' '}
                  {t('evidence.library.sha256')}{' '}
                  <span className="font-mono">{item.file.sha256.slice(0, 12)}…</span>{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void downloadFile(item)}
                  >
                    {t('evidence.library.download')}
                  </button>
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {t('evidence.library.usedBy')}{' '}
              {item.linkedCriteria.length
                ? item.linkedCriteria.map((l) => `${l.cteId}/${l.criterionId}`).join(', ')
                : t('evidence.library.notLinked')}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {focusCriterion ? (
                isLinked(item) ? (
                  <button
                    type="button"
                    className="underline"
                    onClick={() =>
                      unlinkEvidence(item.id, focusCriterion.cteId, focusCriterion.criterionId)
                    }
                  >
                    {t('evidence.library.unlinkFrom', { id: focusCriterion.criterionId })}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="underline text-brand-700"
                    onClick={() =>
                      linkEvidence(item.id, focusCriterion.cteId, focusCriterion.criterionId)
                    }
                  >
                    {t('evidence.library.linkTo', { id: focusCriterion.criterionId })}
                  </button>
                )
              ) : null}
              <button
                type="button"
                className="underline"
                onClick={() => setEditingId(editingId === item.id ? null : item.id)}
              >
                {editingId === item.id
                  ? t('evidence.library.closeEditor')
                  : t('evidence.library.edit')}
              </button>
              <button
                type="button"
                className="underline text-red-700"
                onClick={() => removeEvidence(item.id)}
              >
                {t('evidence.library.delete')}
              </button>
            </div>

            {editingId === item.id ? (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <EvidenceForm
                  editing={item}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {evidence.length === 0 ? <Callout tone="info">{t('evidence.library.empty')}</Callout> : null}

      {adding ? (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold">{t('evidence.library.newHeading')}</h3>
          <EvidenceForm
            onDone={(id) => {
              setAdding(false);
              if (focusCriterion)
                linkEvidence(id, focusCriterion.cteId, focusCriterion.criterionId);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => setAdding(true)}>
          {t('evidence.library.add')}
        </button>
      )}
    </section>
  );
}
