import { useState } from 'react';
import { MAX_EVIDENCE_FILE_BYTES, MAX_EVIDENCE_FILE_MB } from '@/config/app.config';
import { blobKeyFor } from '@/domain/ids';
import { sha256OfBlob } from '@/domain/hash';
import { putBlob } from '@/storage/blobStore';
import { useSessionStore } from '@/state/sessionStore';
import { Callout, Field } from '@/components/ui';
import { useT } from '@/i18n/store';
import type { Translator } from '@/i18n/translate';
import {
  commitShaSchema,
  doiSchema,
  EVIDENCE_TYPES,
  httpUrlSchema,
  MARKINGS,
  SENSITIVE_MARKING,
  VERIFICATIONS,
  type EvidenceItem,
  type EvidenceType,
  type Marking,
  type Verification,
} from '@/domain/schemas';

export interface EvidenceDraft {
  type: EvidenceType;
  title: string;
  description: string;
  date: string;
  owner: string;
  url: string;
  repoUrl: string;
  commitSha: string;
  repoPath: string;
  tag: string;
  doi: string;
  citation: string;
  marking: Marking;
  verification: Verification;
  verifiedBy: string;
  verifiedDate: string;
}

export const BLANK_DRAFT: EvidenceDraft = {
  type: 'Document',
  title: '',
  description: '',
  date: '',
  owner: '',
  url: '',
  repoUrl: '',
  commitSha: '',
  repoPath: '',
  tag: '',
  doi: '',
  citation: '',
  marking: 'Internal (unrestricted)',
  verification: 'Unverified',
  verifiedBy: '',
  verifiedDate: '',
};

const FILE_TYPES: EvidenceType[] = ['Document', 'Test data', 'Drawing/CAD', 'Photo/Video', 'Other'];

export function fromEvidence(item: EvidenceItem): EvidenceDraft {
  return {
    ...BLANK_DRAFT,
    type: item.type,
    title: item.title,
    description: item.description ?? '',
    date: item.date ?? '',
    owner: item.owner ?? '',
    url: item.url ?? '',
    repoUrl: item.repoUrl ?? '',
    commitSha: item.commitSha ?? '',
    repoPath: item.repoPath ?? '',
    tag: item.tag ?? '',
    doi: item.doi ?? '',
    citation: item.citation ?? '',
    marking: item.marking,
    verification: item.verification,
    verifiedBy: item.verifiedBy ?? '',
    verifiedDate: item.verifiedDate ?? '',
  };
}

export function validateDraft(tr: Translator, draft: EvidenceDraft): string[] {
  const { t } = tr;
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push(t('evidence.error.titleRequired'));
  if (draft.url && !httpUrlSchema.safeParse(draft.url).success)
    errors.push(t('evidence.error.urlScheme'));
  if (draft.repoUrl && !httpUrlSchema.safeParse(draft.repoUrl).success)
    errors.push(t('evidence.error.repoUrlScheme'));
  if (draft.commitSha && !commitShaSchema.safeParse(draft.commitSha).success)
    errors.push(t('evidence.error.commitSha'));
  if (draft.doi && !doiSchema.safeParse(draft.doi).success) errors.push(t('evidence.error.doi'));
  if (draft.type === 'Code repository' && !draft.repoUrl)
    errors.push(t('evidence.error.codeNeedsRepo'));
  if (draft.type === 'Code repository' && !draft.commitSha)
    errors.push(t('evidence.error.codeNeedsSha'));
  if (draft.type === 'Publication (DOI)' && !draft.doi && !draft.url)
    errors.push(t('evidence.error.publicationNeedsDoi'));
  if (draft.type === 'Web link' && !draft.url) errors.push(t('evidence.error.webLinkNeedsUrl'));
  return errors;
}

function toEvidence(draft: EvidenceDraft, file?: EvidenceItem['file']): Omit<EvidenceItem, 'id'> {
  return {
    type: draft.type,
    title: draft.title.trim(),
    ...(draft.description ? { description: draft.description } : {}),
    ...(draft.date ? { date: draft.date } : {}),
    ...(draft.owner ? { owner: draft.owner } : {}),
    ...(draft.url ? { url: draft.url } : {}),
    ...(draft.repoUrl ? { repoUrl: draft.repoUrl } : {}),
    ...(draft.commitSha ? { commitSha: draft.commitSha } : {}),
    ...(draft.repoPath ? { repoPath: draft.repoPath } : {}),
    ...(draft.tag ? { tag: draft.tag } : {}),
    ...(draft.doi ? { doi: draft.doi } : {}),
    ...(draft.citation ? { citation: draft.citation } : {}),
    ...(file ? { file } : {}),
    marking: draft.marking,
    verification: draft.verification,
    ...(draft.verifiedBy ? { verifiedBy: draft.verifiedBy } : {}),
    ...(draft.verifiedDate ? { verifiedDate: draft.verifiedDate } : {}),
    linkedCriteria: [],
  };
}

interface Props {
  editing?: EvidenceItem;
  onDone: (id: string) => void;
  onCancel?: () => void;
}

export function EvidenceForm({ editing, onDone, onCancel }: Props) {
  const tr = useT();
  const { t } = tr;
  const addEvidence = useSessionStore((s) => s.addEvidence);
  const updateEvidence = useSessionStore((s) => s.updateEvidence);
  const session = useSessionStore((s) => s.session);
  const [draft, setDraft] = useState<EvidenceDraft>(editing ? fromEvidence(editing) : BLANK_DRAFT);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const sensitive = draft.marking === SENSITIVE_MARKING;
  const acceptsFile = FILE_TYPES.includes(draft.type) && !sensitive;
  const existingFile = editing?.file;

  const set = <K extends keyof EvidenceDraft>(key: K, value: EvidenceDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const pickFile = (picked: File | null) => {
    setErrors([]);
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size > MAX_EVIDENCE_FILE_BYTES) {
      setErrors([
        t('evidence.error.fileTooLarge', {
          name: picked.name,
          size: (picked.size / 1024 / 1024).toFixed(1),
          limit: MAX_EVIDENCE_FILE_MB,
        }),
      ]);
      setFile(null);
      return;
    }
    setFile(picked);
    if (!draft.title.trim()) set('title', picked.name);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateDraft(tr, draft);
    if (found.length) {
      setErrors(found);
      return;
    }
    setBusy(true);
    try {
      let fileMeta = sensitive ? undefined : existingFile;
      const nextId =
        editing?.id ?? `EV-${String((session.tier2?.evidence.length ?? 0) + 1).padStart(4, '0')}`;

      if (file && !sensitive) {
        const sha256 = await sha256OfBlob(file);
        const blobKey = blobKeyFor(nextId);
        await putBlob(blobKey, file);
        fileMeta = {
          name: file.name,
          sizeBytes: file.size,
          sha256,
          ...(file.type ? { mime: file.type } : {}),
          blobKey,
        };
      }

      if (editing) {
        updateEvidence(editing.id, {
          ...toEvidence(draft, fileMeta),
          linkedCriteria: editing.linkedCriteria,
        });
        onDone(editing.id);
      } else {
        const id = addEvidence(toEvidence(draft, fileMeta));
        onDone(id);
      }
      setDraft(BLANK_DRAFT);
      setFile(null);
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : String(err)]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('evidence.form.type')} htmlFor="ev-type">
          <select
            id="ev-type"
            className="input"
            value={draft.type}
            onChange={(e) => set('type', e.target.value as EvidenceType)}
          >
            {EVIDENCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`evidenceType.${type}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('evidence.form.title')} htmlFor="ev-title" required>
          <input
            id="ev-title"
            className="input"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('evidence.form.description')} htmlFor="ev-description">
        <textarea
          id="ev-description"
          className="input"
          rows={2}
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('evidence.form.date')} htmlFor="ev-date" hint={t('evidence.form.dateHint')}>
          <input
            id="ev-date"
            className="input"
            placeholder={t('evidence.form.datePlaceholder')}
            value={draft.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </Field>
        <Field label={t('evidence.form.owner')} htmlFor="ev-owner">
          <input
            id="ev-owner"
            className="input"
            value={draft.owner}
            onChange={(e) => set('owner', e.target.value)}
          />
        </Field>
      </div>

      {draft.type === 'Code repository' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('evidence.form.repoUrl')} htmlFor="ev-repo" required>
            <input
              id="ev-repo"
              className="input"
              value={draft.repoUrl}
              onChange={(e) => set('repoUrl', e.target.value)}
            />
          </Field>
          <Field
            label={t('evidence.form.commitSha')}
            htmlFor="ev-sha"
            required
            hint={t('evidence.form.commitShaHint')}
          >
            <input
              id="ev-sha"
              className="input font-mono"
              value={draft.commitSha}
              onChange={(e) => set('commitSha', e.target.value)}
            />
          </Field>
          <Field label={t('evidence.form.repoPath')} htmlFor="ev-path">
            <input
              id="ev-path"
              className="input"
              value={draft.repoPath}
              onChange={(e) => set('repoPath', e.target.value)}
            />
          </Field>
          <Field label={t('evidence.form.tag')} htmlFor="ev-tag">
            <input
              id="ev-tag"
              className="input"
              value={draft.tag}
              onChange={(e) => set('tag', e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {draft.type === 'Publication (DOI)' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('evidence.form.doi')} htmlFor="ev-doi" hint={t('evidence.form.doiHint')}>
            <input
              id="ev-doi"
              className="input font-mono"
              value={draft.doi}
              onChange={(e) => set('doi', e.target.value)}
            />
          </Field>
          <Field label={t('evidence.form.citation')} htmlFor="ev-citation">
            <input
              id="ev-citation"
              className="input"
              value={draft.citation}
              onChange={(e) => set('citation', e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      <Field label={t('evidence.form.url')} htmlFor="ev-url" hint={t('evidence.form.urlHint')}>
        <input
          id="ev-url"
          className="input"
          value={draft.url}
          onChange={(e) => set('url', e.target.value)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('evidence.form.marking')} htmlFor="ev-marking">
          <select
            id="ev-marking"
            className="input"
            value={draft.marking}
            onChange={(e) => set('marking', e.target.value as Marking)}
          >
            {MARKINGS.map((m) => (
              <option key={m} value={m}>
                {t(`marking.${m}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('evidence.form.verification')} htmlFor="ev-verification">
          <select
            id="ev-verification"
            className="input"
            value={draft.verification}
            onChange={(e) => set('verification', e.target.value as Verification)}
          >
            {VERIFICATIONS.map((v) => (
              <option key={v} value={v}>
                {t(`verification.${v}`)}
              </option>
            ))}
          </select>
        </Field>
        {draft.verification !== 'Unverified' ? (
          <>
            <Field label={t('evidence.form.verifiedBy')} htmlFor="ev-verified-by">
              <input
                id="ev-verified-by"
                className="input"
                value={draft.verifiedBy}
                onChange={(e) => set('verifiedBy', e.target.value)}
              />
            </Field>
            <Field label={t('evidence.form.verifiedDate')} htmlFor="ev-verified-date">
              <input
                id="ev-verified-date"
                className="input"
                placeholder={t('evidence.form.datePlaceholder')}
                value={draft.verifiedDate}
                onChange={(e) => set('verifiedDate', e.target.value)}
              />
            </Field>
          </>
        ) : null}
      </div>

      {sensitive ? (
        <Callout tone="warning" title={t('evidence.form.sensitiveTitle')}>
          {t('notice.sensitive')} {t('evidence.form.sensitiveBody')}
        </Callout>
      ) : null}

      {acceptsFile ? (
        <Field
          label={t('evidence.form.file')}
          htmlFor="ev-file"
          hint={t('evidence.form.fileHint', { limit: MAX_EVIDENCE_FILE_MB })}
        >
          <input
            id="ev-file"
            type="file"
            className="input"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="mt-1 text-xs text-slate-600">
              {t('evidence.form.pickedFile', {
                name: file.name,
                size: (file.size / 1024).toFixed(0),
              })}
            </p>
          ) : existingFile ? (
            <p className="mt-1 text-xs text-slate-600">
              {t('evidence.form.attachedFile', {
                name: existingFile.name,
                size: (existingFile.sizeBytes / 1024).toFixed(0),
              })}{' '}
              {t('evidence.form.sha256')}{' '}
              <span className="font-mono">{existingFile.sha256.slice(0, 16)}…</span>
            </p>
          ) : null}
        </Field>
      ) : null}

      {errors.length ? (
        <div role="alert">
          <Callout tone="danger">
            <ul className="list-disc ps-4">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Callout>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy
            ? t('evidence.form.saving')
            : editing
              ? t('evidence.form.save')
              : t('evidence.form.add')}
        </button>
        {onCancel ? (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {t('evidence.form.cancel')}
          </button>
        ) : null}
      </div>
    </form>
  );
}
