import { useState } from 'react';
import {
  MAX_EVIDENCE_FILE_BYTES,
  MAX_EVIDENCE_FILE_MB,
  SENSITIVE_DATA_NOTICE,
} from '@/config/app.config';
import { blobKeyFor } from '@/domain/ids';
import { sha256OfBlob } from '@/domain/hash';
import { putBlob } from '@/storage/blobStore';
import { useSessionStore } from '@/state/sessionStore';
import { Callout, Field } from '@/components/ui';
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

export function validateDraft(draft: EvidenceDraft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push('A title is required.');
  if (draft.url && !httpUrlSchema.safeParse(draft.url).success)
    errors.push('The URL must be an http or https address.');
  if (draft.repoUrl && !httpUrlSchema.safeParse(draft.repoUrl).success)
    errors.push('The repository URL must be an http or https address.');
  if (draft.commitSha && !commitShaSchema.safeParse(draft.commitSha).success)
    errors.push('The commit SHA must be 7–40 hexadecimal characters.');
  if (draft.doi && !doiSchema.safeParse(draft.doi).success)
    errors.push('The DOI must look like 10.1234/suffix.');
  if (draft.type === 'Code repository' && !draft.repoUrl)
    errors.push('Code evidence needs a repository URL.');
  if (draft.type === 'Code repository' && !draft.commitSha)
    errors.push('Code evidence must pin a commit SHA — a branch name is not evidence.');
  if (draft.type === 'Publication (DOI)' && !draft.doi && !draft.url)
    errors.push('Publication evidence needs a DOI or a URL.');
  if (draft.type === 'Web link' && !draft.url) errors.push('Web-link evidence needs a URL.');
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
        `“${picked.name}” is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_EVIDENCE_FILE_MB} MB — link to it instead of attaching it.`,
      ]);
      setFile(null);
      return;
    }
    setFile(picked);
    if (!draft.title.trim()) set('title', picked.name);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateDraft(draft);
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
        <Field label="Type" htmlFor="ev-type">
          <select
            id="ev-type"
            className="input"
            value={draft.type}
            onChange={(e) => set('type', e.target.value as EvidenceType)}
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" htmlFor="ev-title" required>
          <input
            id="ev-title"
            className="input"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="ev-description">
        <textarea
          id="ev-description"
          className="input"
          rows={2}
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" htmlFor="ev-date" hint="When the evidence was produced.">
          <input
            id="ev-date"
            className="input"
            placeholder="YYYY-MM-DD"
            value={draft.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </Field>
        <Field label="Owner / custodian" htmlFor="ev-owner">
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
          <Field label="Repository URL" htmlFor="ev-repo" required>
            <input
              id="ev-repo"
              className="input"
              value={draft.repoUrl}
              onChange={(e) => set('repoUrl', e.target.value)}
            />
          </Field>
          <Field
            label="Commit SHA"
            htmlFor="ev-sha"
            required
            hint="Always pin a commit; a branch name moves."
          >
            <input
              id="ev-sha"
              className="input font-mono"
              value={draft.commitSha}
              onChange={(e) => set('commitSha', e.target.value)}
            />
          </Field>
          <Field label="Path in the repository" htmlFor="ev-path">
            <input
              id="ev-path"
              className="input"
              value={draft.repoPath}
              onChange={(e) => set('repoPath', e.target.value)}
            />
          </Field>
          <Field label="Tag / release" htmlFor="ev-tag">
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
          <Field label="DOI" htmlFor="ev-doi" hint="For example 10.1234/abcd.2026.5678">
            <input
              id="ev-doi"
              className="input font-mono"
              value={draft.doi}
              onChange={(e) => set('doi', e.target.value)}
            />
          </Field>
          <Field label="Citation" htmlFor="ev-citation">
            <input
              id="ev-citation"
              className="input"
              value={draft.citation}
              onChange={(e) => set('citation', e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      <Field
        label="Location / URL"
        htmlFor="ev-url"
        hint="http or https only. Use this for anything that already lives somewhere reachable."
      >
        <input
          id="ev-url"
          className="input"
          value={draft.url}
          onChange={(e) => set('url', e.target.value)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Marking" htmlFor="ev-marking">
          <select
            id="ev-marking"
            className="input"
            value={draft.marking}
            onChange={(e) => set('marking', e.target.value as Marking)}
          >
            {MARKINGS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Verification" htmlFor="ev-verification">
          <select
            id="ev-verification"
            className="input"
            value={draft.verification}
            onChange={(e) => set('verification', e.target.value as Verification)}
          >
            {VERIFICATIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        {draft.verification !== 'Unverified' ? (
          <>
            <Field label="Verified by" htmlFor="ev-verified-by">
              <input
                id="ev-verified-by"
                className="input"
                value={draft.verifiedBy}
                onChange={(e) => set('verifiedBy', e.target.value)}
              />
            </Field>
            <Field label="Verified date" htmlFor="ev-verified-date">
              <input
                id="ev-verified-date"
                className="input"
                placeholder="YYYY-MM-DD"
                value={draft.verifiedDate}
                onChange={(e) => set('verifiedDate', e.target.value)}
              />
            </Field>
          </>
        ) : null}
      </div>

      {sensitive ? (
        <Callout tone="warning" title="Reference only — no file can be attached">
          {SENSITIVE_DATA_NOTICE} Record the title, the custodian and a reference number so a
          reviewer can find the material through the proper channel.
        </Callout>
      ) : null}

      {acceptsFile ? (
        <Field
          label="File"
          htmlFor="ev-file"
          hint={`Stored in this browser only (IndexedDB). Maximum ${MAX_EVIDENCE_FILE_MB} MB. A SHA-256 hash is computed when you add it.`}
        >
          <input
            id="ev-file"
            type="file"
            className="input"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="mt-1 text-xs text-slate-600">
              {file.name} — {(file.size / 1024).toFixed(0)} kB
            </p>
          ) : existingFile ? (
            <p className="mt-1 text-xs text-slate-600">
              Attached: {existingFile.name} — {(existingFile.sizeBytes / 1024).toFixed(0)} kB ·
              SHA-256 <span className="font-mono">{existingFile.sha256.slice(0, 16)}…</span>
            </p>
          ) : null}
        </Field>
      ) : null}

      {errors.length ? (
        <div role="alert">
          <Callout tone="danger">
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Callout>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save evidence' : 'Add evidence'}
        </button>
        {onCancel ? (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
